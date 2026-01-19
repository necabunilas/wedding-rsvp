export interface Guest {
  id: string;
  name: string;
  seatsAllocated: number;
}

export interface RsvpResponse {
  guestId: string;
  guestName: string;
  seatsConfirmed: number;
  dietaryRestrictions: string;
  respondedAt: string;
}

export interface GuestWithRsvp extends Guest {
  seatsConfirmed: number | null;
  dietaryRestrictions: string;
  respondedAt: string | null;
}

export interface EventDetails {
  coupleName: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  receptionVenue?: string;
  receptionAddress?: string;
  rsvpDeadline: string;
}

export interface GuestData {
  guests: Guest[];
  eventDetails: EventDetails;
}
