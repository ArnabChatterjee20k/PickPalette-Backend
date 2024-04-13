const generateRandomId = () => {
    const randomNumber = +new Date() + Math.floor(Math.random() * 999999);
  
    return randomNumber;
  };
  
export default generateRandomId;