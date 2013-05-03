//Get database and turn it into data to use as check
function start(){
	signuperror = document.getElementById("signuperror");
	loginerror = document.getElementById("loginerror");
	//Use get API of member database here
	request = new XMLHttpRequest();
	request.open("GET", "http://limitless-beyond-4298.herokuapp.com/members", true);
	request.send(null);
	request.onreadystatechange = function(){
		if (request.readyState == 4 && request.status == 200) {
     		database = JSON.parse(request.responseText);
      	}
	}
}

//Checks if the fields for the sign up form is submitted with valid answers
function check_fields(){
	
	name_ = document.forms["form1"]["fullname"].value;
	address_ = document.forms["form1"]["address"].value;
	age_ = document.forms["form1"]["age"].value;
	email_ = document.forms["form1"]["email"].value;
	username_ = document.forms["form1"]["username"].value;
	
	pass1 = document.forms["form1"]["password"].value;
	pass2 = document.forms["form1"]["confirm-pw"].value;
	
	//check if password is at least 6 characters
	if (pass1.length < 6){
		signuperrormsg('Passwords need to be at least 6 characters long!');
		resetPassFields();
		return false;
	}
	
	//check if the user input their password correctly
	if (pass1 != pass2){
		signuperrormsg('Passwords do not match!');
		resetPassFields();
		return false;
	}
	
	//If passwords are fine check other fields
	if (pass1 == pass2){
		if ( $.inArray(name_ , database) > -1 ) {
			signuperrormsg('Name {' + name_ + '} is already registered in our database!');
			return false;
		}
		if ( $.inArray(email_ , database) > -1 ) {
			signuperrormsg('Email {' + email_ + '} is already registered in our database!');
			return false;
		}
		if ( $.inArray(username_ , database) > -1 ) {
			signuperrormsg('Username {' + username_ + '} is already registered in our database!');
			return false;
		}
		//Reaching here means all fields are good to be posted to database
		//POST API HERE
		else{
			data = {"fullname": name_, "address": address_, "age": age_, "email": email_, "username": username_, "password": pass1};
			request = new XMLHttpRequest();
			request.open("POST", "http://limitless-beyond-4298.herokuapp.com/memberpost.json", true);
			request.send(data);
		}
	}
}

//Check for the member sign in form is correct
function check_login(){
	logname_ = document.forms["form2"]["login-name"].value;
	logpw_ = document.forms["form2"]["login-pw"].value;
	
	//Username or pw does not exist in database
	//Error does not give away too much information (security)
	if (( $.inArray(logname_ , database) < 0 )||( $.inArray(logpw_ , database) < 0 )) {
			loginerrormsg('Username and password combination is wrong!');
			return false;
	}
	//Username is in database
	if ( $.inArray(logname_ , database) > -1 ) {
		//Need to check to see if password is matching
		if (logpw_ != SOMETHINGGOESHERE__________________________________){
			loginerrormsg('Username and password combination is wrong!');
			return false;
		}
		//logs in the user somehow aka redirects to main page with user credentials
		else if (logpw_ == SOMETHINGGOESHERE_________________________________){
			return true;
		}
	}
}

//Resets the password fields for the sign up form
function resetPassFields(){
	document.forms["form1"]["password"].value = "";
	document.forms["form1"]["confirm-pw"].value = "";
	document.forms["form2"]["login-pw"].value = "";
}

//Error sending to signuperror
function signuperrormsg(str){
	signuperror.innerHTML = '<p class = "error">Sign Up Error: ' + str+ '</p>';
}

//Error sending to loginerror
function loginerrormsg(str){
	loginerror.innerHTML = '<p class = "error">Sign In Error: ' + str+ '</p>';
}
