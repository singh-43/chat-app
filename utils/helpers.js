import moment from "moment";

export const formatDate = (date) => {
    const now = new Date();
    const diff = now.getTime() - date?.getTime();

    if(diff < 86400000){
        return moment(date).format("h:mm a")
    }

    return `${moment(date).format("DD/MM/YY")}`
}

export const dateHelper = (date) => {
    const now = new Date();
    const diff = now.getTime() - date?.getTime();
    return `${moment(date).format("DD MMMM, YYYY")}`
}

export const timeHelper = (date) => {
    const now = new Date();
    const diff = now.getTime() - date?.getTime();
    return moment(date).format("h:mm a")
}

export const formatDateLastSeen = (date) => {
    const now = new Date();
    const diff = now.getDate() - date?.getDate();
    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[date?.getDay()];

    if(diff === 0){
        return `last seen today at ${moment(date).format("h:mm a")}`
    }

    if(diff === 1){
        return `last seen yesterday at ${moment(date).format("h:mm a")}`
    }

    if(diff === 2){
        return `last seen on ${dayName} at ${moment(date).format("h:mm a")}`
    }

    if(diff === 3){
        return `last seen on ${dayName} at ${moment(date).format("h:mm a")}`
    }

    if(diff === 4){
        return `last seen on ${dayName} at ${moment(date).format("h:mm a")}`
    }

    if(diff === 5){
        return `last seen on ${dayName} at ${moment(date).format("h:mm a")}`
    }

    if(diff === 6){
        return `last seen on ${dayName} at ${moment(date).format("h:mm a")}`
    }
    
    return `last seen ${moment(date).format("MMM DD, YYYY")}`
}