let date = new Date();
let ele = document.getElementById('date');
let year = date.getFullYear();
let month = (date.getMonth() + 1).toString().padStart(2, '0');
let day = date.getDate().toString().padStart(2, '0');
let strDate = year + '-' + month + '-' + day;
ele.valueAsDate = date;
ele.value = strDate;