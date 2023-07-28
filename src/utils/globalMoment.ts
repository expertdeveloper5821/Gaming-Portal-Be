
// Get the current date
export function getCurrentDate(): Date {
    return new Date();
  }
  
  // Format a date to a specified format (e.g., "YYYY-MM-DD")
  export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
  
    return format
      .replace("YYYY", String(year))
      .replace("MM", month)
      .replace("DD", day);
  }
  
  // Add days to a given date
  export function addDaysToDate(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }
  