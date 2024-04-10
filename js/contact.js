window.onload = function () {
    init();
    var tags = ["Mac", "iPhone", "AirPods", "iPad", "Watch"];
    for (var t of tags) {
        addTags(t, "index.html?search=" + t);
    }
}
function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('email').value = '';
    document.getElementById('title').value = '';
    document.getElementsByName('message')[0].value = '';
}

function user() {
    var name = document.getElementById('name').value;
    var phone = document.getElementById('phone').value;
    var email = document.getElementById('email').value;
    var title = document.getElementById('title').value;
    var message = document.getElementsByName('message')[0].value;

    if (name === '' || /[^a-zA-Z\s]/.test(name)) {
        addAlertBox('Please enter a valid name.','red', '#fff', 1000);
        return false;
    }

    if (phone.length < 10 || /[^0-9]/.test(phone)) {
        addAlertBox('Please enter a valid phone number (at least 10 numbers)', 'red', '#fff', 1000);
        return false;
    }

    if (email === '' || !/\S+@\S+\.\S+/.test(email)) {
        addAlertBox('Please enter a valid email (Ex: example@example.com)','red', '#fff', 1000);
        return false;
    }

    if (title === '') {
        addAlertBox('Please enter a title.','red', '#fff', 1000)
        return false;
    }

    if (message === '') {
        addAlertBox('Please enter a message.','red', '#fff', 1000)
        return false;
    }


    clearForm(); 
    addAlertBox('Submitted successfully. We sincerely thank you for your feedback ^^', '#17c671', '#fff', 3000);
    return false; 
}
document.getElementById('contactform').onsubmit = user;