import moment from "moment";

export const handleDragStart = (e) => e.preventDefault();

export const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener noreferrer");
};

export const findSize = (file_size) => {
    let i=0;
    for(i = 0; i < 10; i++){
        if(file_size > 1024){
            file_size /= 1024;
        }else{
            break;
        }
    }
    
    if( i === 0) return file_size.toFixed(2).toString() + " B";
    if( i === 1) return file_size.toFixed(2).toString() + " KB";
    if( i === 2) return file_size.toFixed(2).toString() + " MB";
    if( i === 3) return file_size.toFixed(2).toString() + " GB";
    return file_size.toFixed(2).toString() + "TB";
}

export const checkSize = (file_size, file_type) => {
    if(file_type === "image" || file_type === "audio") return false;
    let i=0;
    for(i = 0; i < 10; i++){
        if(file_size > 1024){
            file_size /= 1024;
        }else{
            break;
        }
    }
    if(file_type === "video"){
        if( i < 2 ) return false;
        if( i === 2 && file_size <= 100 ) return false
    }
    if(file_type !== "image" && file_type !== "audio" && file_type !== "video"){
        if( i < 3 ) return false;
        if( i === 3 && file_size <= 2 ) return false
    }
    return true;
}

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