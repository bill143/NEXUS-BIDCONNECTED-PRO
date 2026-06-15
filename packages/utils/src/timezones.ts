/**
 * Curated list of IANA timezones commonly used in US/Canada construction.
 */
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const US_TIMEZONES: TimezoneOption[] = [
  { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5/UTC-4" },
  { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6/UTC-5" },
  { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7/UTC-6" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8/UTC-7" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "UTC-9/UTC-8" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)", offset: "UTC-10" },
  { value: "America/Phoenix", label: "Arizona (no DST)", offset: "UTC-7" },
  { value: "America/Indiana/Indianapolis", label: "Indiana (Eastern)", offset: "UTC-5/UTC-4" },
];

export const CANADA_TIMEZONES: TimezoneOption[] = [
  { value: "America/Halifax", label: "Atlantic Time (AT)", offset: "UTC-4/UTC-3" },
  { value: "America/St_Johns", label: "Newfoundland (NT)", offset: "UTC-3:30/UTC-2:30" },
  { value: "America/Winnipeg", label: "Central Canada", offset: "UTC-6/UTC-5" },
  { value: "America/Edmonton", label: "Mountain Canada", offset: "UTC-7/UTC-6" },
  { value: "America/Vancouver", label: "Pacific Canada", offset: "UTC-8/UTC-7" },
];

export const GLOBAL_TIMEZONES: TimezoneOption[] = [
  { value: "UTC", label: "UTC", offset: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)", offset: "UTC+0/UTC+1" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)", offset: "UTC+1/UTC+2" },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: "UTC+4" },
  { value: "Asia/Kolkata", label: "India (IST)", offset: "UTC+5:30" },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)", offset: "UTC+10/UTC+11" },
];

export const ALL_TIMEZONES: TimezoneOption[] = [
  ...US_TIMEZONES,
  ...CANADA_TIMEZONES,
  ...GLOBAL_TIMEZONES,
];

/**
 * Search timezones by label or value.
 */
export function searchTimezones(query: string): TimezoneOption[] {
  const lower = query.toLowerCase();
  return ALL_TIMEZONES.filter(
    (tz) =>
      tz.label.toLowerCase().includes(lower) ||
      tz.value.toLowerCase().includes(lower)
  );
}

/**
 * Get timezone label by IANA value.
 */
export function getTimezoneLabel(value: string): string {
  const tz = ALL_TIMEZONES.find((t) => t.value === value);
  return tz ? tz.label : value;
}

/**
 * US States list for address forms.
 */
export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "PR", name: "Puerto Rico" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "VI", name: "Virgin Islands" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;