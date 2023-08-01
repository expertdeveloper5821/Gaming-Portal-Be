export function printSuccess(message: string): void {
    console.log('\x1b[32m%s\x1b[0m', message); // Green color
  }
  
  export function printError(message: string): void {
    console.log('\x1b[31m%s\x1b[0m', message); // Red color
  }
  