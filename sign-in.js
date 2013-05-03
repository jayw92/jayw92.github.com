//Get database and turn it into data to use as check
    var database;
	var actualPW;
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
	}
	
	//check if the user input their password correctly
	if (pass1 != pass2){
		signuperrormsg('Passwords do not match!');
		resetPassFields();
	}
	
	//If passwords are fine check other fields
	if (pass1 == pass2){
		var redir = 1;
		for (i in database){
			if (database[i]["fullname"] == name_){
				signuperrormsg('Name {' + name_ + '} is already registered in our database!');
			redir = 0;
			}
			if (database[i]["email"] == email_){
			signuperrormsg('Email {' + email_ + '} is already registered in our database!');
			redir = 0;
			}
			if (database[i]["username"] == username_){
			signuperrormsg('Username {' + username_ + '} is already registered in our database!');
			redir = 0;
			}
		}
		//Reaching here means all fields are good to be posted to database
		//POST API HERE
		if (redir == 1){
			data = {"fullname": name_, "address": address_, "age": age_, "email": email_, "username": username_, "password": pass1};
			$.post('http://limitless-beyond-4298.herokuapp.com/memberpost.json', data);
			window.location = "index.html";
		}
	}
}

//Check for the member sign in form is correct
function check_login(){
	logname_ = document.forms["form2"]["login-name"].value;
	logpw_ = document.forms["form2"]["login-pw"].value;
	//Error does not give away too much information (security)
	request2 = new XMLHttpRequest();
	request2.open("GET", "http://limitless-beyond-4298.herokuapp.com/passwordcheck?username=" + logname_, true);
	request2.send(null);
	request2.onreadystatechange = function(){
		if (request2.readyState == 4 && request2.status == 200) {
     		actualPW = request2.responseText;
      	}
	}
		//Need to check to see if password is matching
		if (logpw_ != actualPW){
			resetPassFields();
			loginerrormsg('Username and password combination is wrong!');
		}
		//logs in the user somehow aka redirects to main page with user credentials
		else{
			window.location = "index.html";
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
