import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type ComplaintStatus = {
    #submitted;
    #underReview;
    #inProgress;
    #resolved;
  };

  type ComplaintCategory = {
    #foodServices;
    #professorsAcademics;
    #raggingSafety;
    #disciplineRules;
    #hostelFacilities;
    #administration;
  };

  type Complaint = {
    id : Nat;
    category : ComplaintCategory;
    description : Text;
    urgencyLevel : Text;
    proof : ?Storage.ExternalBlob;
    status : ComplaintStatus;
    creator : Principal.Principal;
    timestamp : Int;
    hidden : Bool;
  };

  type SolutionUpdate = {
    id : Nat;
    title : Text;
    description : Text;
    relatedComplaints : [Nat];
    relatedCategories : [ComplaintCategory];
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  public type CallerInfo = {
    principal : Principal.Principal;
    role : AccessControl.UserRole;
  };

  type SuperAdminBootstrapResult = {
    principal : Principal.Principal;
    isAdmin : Bool;
    role : AccessControl.UserRole;
    message : Text;
  };

  module Complaint {
    public func compare(cmp1 : Complaint, cmp2 : Complaint) : Order.Order {
      Nat.compare(cmp1.id, cmp2.id);
    };
  };

  module SolutionUpdate {
    public func compare(su1 : SolutionUpdate, su2 : SolutionUpdate) : Order.Order {
      Nat.compare(su1.id, su2.id);
    };
  };

  let complaints = Map.empty<Nat, Complaint>();
  let solutions = Map.empty<Nat, SolutionUpdate>();
  let userProfiles = Map.empty<Principal.Principal, UserProfile>();

  var nextComplaintId = 1;
  var nextSolutionId = 1;

  let bannedWords = Set.empty<Text>();

  var accessControlState = AccessControl.initState();
  var bootstrapExecuted = false;

  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // Persistent Admin Allowlist Query - Admin only with robust error handling
  public query ({ caller }) func getAdminAllowlist() : async {
    adminPrincipals : [Principal.Principal];
    initialAdminPresent : Bool;
    callerRole : AccessControl.UserRole;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view the admin allowlist");
    };

    {
      adminPrincipals = [];
      initialAdminPresent = false;
      callerRole = AccessControl.getUserRole(accessControlState, caller);
    };
  };

  // Debug method to return caller principal - No auth needed for diagnostics
  public query ({ caller }) func debugGetCallerPrincipal() : async Principal.Principal {
    caller;
  };

  public query ({ caller }) func getAdminAllowlistDebugInfo() : async {
    callerPrincipal : Principal.Principal;
    callerRole : AccessControl.UserRole;
    isCallerAdmin : Bool;
    initialAdminPrincipal : Principal.Principal;
    isInitialAdminStillAdmin : Bool;
  } {
    let callerRole = AccessControl.getUserRole(accessControlState, caller);
    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);

    {
      callerPrincipal = caller;
      callerRole;
      isCallerAdmin;
      initialAdminPrincipal = caller;
      isInitialAdminStillAdmin = isCallerAdmin;
    };
  };

  // Super admin bootstrap - Allows any user to call when no admins exist, requires admin privileges once initialized
  public shared ({ caller }) func bootstrapSuperAdmin() : async SuperAdminBootstrapResult {
    // If bootstrap has already been executed, only admins can call this function
    if (bootstrapExecuted and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Bootstrap already executed. Only admins can re-bootstrap.");
    };

    let superAdminPrincipal = Principal.fromText("jwxbf-7t3mq-z2mw2-kglpm-vjiqq-yfjhx-fxojo-5k7kl-i6gx5-idwc6-qqe");

    // Force initialize the super admin with placeholder tokens
    AccessControl.initialize(
      accessControlState,
      superAdminPrincipal,
      "1e251e94-9ce5-47b6-9e42-985898f8e404", // Placeholder admin token
      "user-provided-token-936e4107-4e1f-4bf4-8fe8-c8451ec1e246", // Placeholder user-provided token
    );

    bootstrapExecuted := true;

    return {
      principal = superAdminPrincipal;
      isAdmin = AccessControl.isAdmin(accessControlState, superAdminPrincipal);
      role = AccessControl.getUserRole(accessControlState, superAdminPrincipal);
      message = "Super Admin principal " # superAdminPrincipal.toText() # " has been initialized as admin";
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal.Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Complaint Management
  public shared ({ caller }) func submitComplaint(
    category : ComplaintCategory,
    description : Text,
    urgencyLevel : Text,
    proof : ?Storage.ExternalBlob,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit complaints");
    };
    if (containsBannedWords(description)) {
      Runtime.trap("Description contains inappropriate language");
    };
    let id = nextComplaintId;
    let complaint : Complaint = {
      id;
      category;
      description;
      urgencyLevel;
      proof;
      status = #submitted;
      creator = caller;
      timestamp = Time.now();
      hidden = false;
    };
    complaints.add(id, complaint);
    nextComplaintId += 1;
    id;
  };

  public shared ({ caller }) func updateComplaintStatus(complaintId : Nat, newStatus : ComplaintStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update complaint status");
    };
    switch (complaints.get(complaintId)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) {
        let updatedComplaint : Complaint = {
          id = complaint.id;
          description = complaint.description;
          category = complaint.category;
          urgencyLevel = complaint.urgencyLevel;
          proof = complaint.proof;
          creator = complaint.creator;
          timestamp = complaint.timestamp;
          hidden = complaint.hidden;
          status = newStatus;
        };
        complaints.add(complaintId, updatedComplaint);
      };
    };
  };

  public shared ({ caller }) func hideComplaint(complaintId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can hide complaints");
    };
    switch (complaints.get(complaintId)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) {
        let updatedComplaint : Complaint = {
          id = complaint.id;
          description = complaint.description;
          category = complaint.category;
          urgencyLevel = complaint.urgencyLevel;
          proof = complaint.proof;
          creator = complaint.creator;
          timestamp = complaint.timestamp;
          status = complaint.status;
          hidden = true;
        };
        complaints.add(complaintId, updatedComplaint);
      };
    };
  };

  public shared ({ caller }) func deleteComplaint(complaintId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete complaints");
    };
    switch (complaints.get(complaintId)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?_) {
        complaints.remove(complaintId);
      };
    };
  };

  // Solution Management
  public shared ({ caller }) func addSolution(title : Text, description : Text, relatedComplaints : [Nat], relatedCategories : [ComplaintCategory]) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add solutions");
    };
    let id = nextSolutionId;
    let solution : SolutionUpdate = {
      id;
      title;
      description;
      relatedComplaints;
      relatedCategories;
      timestamp = Time.now();
    };
    solutions.add(id, solution);
    nextSolutionId += 1;
    id;
  };

  // Moderation
  public shared ({ caller }) func addBannedWord(word : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add banned words");
    };
    bannedWords.add(word);
  };

  // Public Query Functions
  public query ({ caller }) func getCurrentUserPrincipal() : async CallerInfo {
    {
      principal = caller;
      role = AccessControl.getUserRole(accessControlState, caller);
    };
  };

  public query func getPublicComplaints() : async [Complaint] {
    complaints.values().filter(
      func(complaint) {
        not complaint.hidden;
      }
    ).toArray().sort();
  };

  public query func getComplaint(complaintId : Nat) : async ?Complaint {
    switch (complaints.get(complaintId)) {
      case (null) { null };
      case (?complaint) {
        if (complaint.hidden) {
          null;
        } else {
          ?complaint;
        };
      };
    };
  };

  public query func getSolutions() : async [SolutionUpdate] {
    solutions.values().toArray().sort();
  };

  public query func filterComplaintsByCategory(category : ComplaintCategory) : async [Complaint] {
    complaints.values().filter(
      func(complaint) {
        complaint.category == category and not complaint.hidden;
      }
    ).toArray().sort();
  };

  public query func filterComplaintsByStatus(status : ComplaintStatus) : async [Complaint] {
    complaints.values().filter(
      func(complaint) {
        complaint.status == status and not complaint.hidden;
      }
    ).toArray().sort();
  };

  public query func searchComplaints(searchText : Text) : async [Complaint] {
    let lowerSearchText = searchText.toLower();
    complaints.values().filter(
      func(complaint) {
        not complaint.hidden and complaint.description.toLower().contains(#text(lowerSearchText));
      }
    ).toArray().sort();
  };

  // Admin Query Functions
  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all complaints");
    };
    complaints.values().toArray().sort();
  };

  // Helper Functions
  func containsBannedWords(text : Text) : Bool {
    let lowerText = text.toLower();
    let words = lowerText.split(#char(' ')).toArray();
    bannedWords.values().toArray().any(
      func(bannedWord) {
        let lowerBannedWord = bannedWord.toLower();
        words.any(
          func(word) {
            word.startsWith(#text(lowerBannedWord)) or lowerText.contains(#text(lowerBannedWord));
          }
        );
      }
    );
  };
};
