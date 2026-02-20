import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

module {
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

  type UserProfile = {
    name : Text;
    email : ?Text;
  };

  type Actor = {
    complaints : Map.Map<Nat, Complaint>;
    solutions : Map.Map<Nat, SolutionUpdate>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextComplaintId : Nat;
    nextSolutionId : Nat;
    bannedWords : Set.Set<Text>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
