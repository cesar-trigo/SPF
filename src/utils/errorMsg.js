export const errorMsg = (errorSite, errorName, cause) => {
  return `
  Date:  ${new Date().toUTCString()} 
  name:  ${errorName} 
  sitie: ${errorSite}
  Cause: ${cause}`;
};
