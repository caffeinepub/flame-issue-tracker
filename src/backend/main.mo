import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
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
    creator : Principal;
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
    principal : Principal;
    role : AccessControl.UserRole;
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
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextComplaintId = 1;
  var nextSolutionId = 1;

  let bannedWords = Set.empty<Text>();
  let accessControlState = AccessControl.initState();

  include MixinStorage();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
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
    proof : ?Storage.ExternalBlob
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
    // No authorization check - all callers (including guests) can query their own identity
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
