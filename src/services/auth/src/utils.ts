export const generateVerificationCode = () => {
    // get current tmestamp in milliseconds
    const timestamp = new Date().getTime().toString();

    // generate code
    const randomNum = Math.floor(10 * Math.random() * 90);

    let code = (timestamp + randomNum).slice(-5);
    return code;
}