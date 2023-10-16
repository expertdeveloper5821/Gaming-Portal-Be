export const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;

// email validation
export const emailValidate = (email: string): boolean => {
    if (String(email).match(/^[A-Za-z0-9._%-]+@(?:[A-Za-z0-9-]+\.)+(com|co\.in|yahoo\.com)$/)) {
      return true;
    } else {
      return false;
    }
  };
  
  
  

  // function convertToIST(inputDate: string | number | Date) {
  //   var dateUTC = new Date(inputDate);
  //   var dateTime = dateUTC.getTime();
  //   var dateIST = new Date(dateTime);
  //   dateIST.setHours(dateIST.getHours() + 5);
  //   dateIST.setMinutes(dateIST.getMinutes() + 30);
  //   return dateIST;
  // }
  // var inputDate = "2023-09-15T02:00:00Z"; 
  // var convertedDate = convertToIST(inputDate);
  // console.log(convertedDate);