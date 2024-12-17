import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateInSeconds) => {
    console.log(dateInSeconds)
    if (!dateInSeconds || isNaN(dateInSeconds) || dateInSeconds < 0) {
        return "";
    }
    const currentTimeInSeconds = Date.now() / 1000; // Convert current time to seconds
    const seconds = currentTimeInSeconds - dateInSeconds;


    // date.now is in ms, we are passing in as seconds
    // const seconds = (Date.now() / 1000) - dateInSeconds
    console.log(Date.now())
    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    const year = 365 * day;

    if (seconds < minute) {
        return "Just now";
    } else if (seconds < hour) {
        const minutes = Math.floor(seconds / minute);
        return `${minutes} min ago`;
    } else if (seconds < day) {
        const hours = Math.floor(seconds / hour);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (seconds < month) {
        const days = Math.floor(seconds / day);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (seconds < year) {
        const months = Math.floor(seconds / month);
        return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(seconds / year);
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
}


export const formatDateForMessages = (dateInSeconds) => {
    if (!dateInSeconds || isNaN(dateInSeconds)) return '';
    const date = new Date(dateInSeconds * 1000); // using the Date constructor
    const now = new Date();
    const difference = now - date;

    // today: 3:30 PM
    if (difference < 24 * 60 * 60 * 1000) {
        return `Today at ${format(date, 'p')}`;
    }
    // this week. 'Tuesday at 3:30 PM'
    if (difference < 7 * 24 * 60 * 60 * 1000) {
        return `${format(date, 'EEEE')} at ${format(date, 'p')}`;
    }
    // else:  'Jan 1, 2024 at 3:30 PM'
    return format(date, 'PPP');
}   