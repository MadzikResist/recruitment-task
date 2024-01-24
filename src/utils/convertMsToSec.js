export const convertMsToSec = (ms) => {
    const padTo2Digits= (num) => {
        return num.toString().padStart(2, '0');
    }
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.round((ms % 60000) / 1000);

    return seconds === 60
        ? `${padTo2Digits(minutes + 1)}:00`
        : `${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}
