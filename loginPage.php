<!DOCTYPE html>
<html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<head>
	<link rel='stylesheet' href="style.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<title>Login</title>
<style>
.Login11{
     width:100px;
     height:100px;
     border-radius:50%;
     position:absolute;
     top:-51px;
     left:calc(50% - 55px);
}
.topStyle{
	top:0;
	padding:10px;
	position:fixed;
	left:0;
	height:70px;
	width:100%;
	background-color:black	;
	z-index: 10;
}

</style>

</head> 
<body class='loginBody' background="png">
	<div class="topStyle">
		<h2 style="color:ghostwhite;">Grocigo : Grocery On Go</h2>
		<button id='userLogin' class='btn'>Login</button>&nbsp
		<button id='createAccount' class='btn'>Create New Account</button>
	</div>
	<div class="mybox" style="display:inline-block;">
		<div id="userPrompt" style="display:block;">
			<form method='post' action='login.php'>
      <img src="login1.png" class="Login11">
				<h3>Login</h3>
				<input class="inputItem" type=text name='user' placeholder="Username" required><br><input class="inputItem" type=password name='pass' placeholder="Password" required><br><input type="submit" value="Login" class="btn">
			</form>	
		</div>
		<div id="createAccountPrompt" style="display:none;">
			<form id='createAccountForm' method='post' action='createAccount.php'>
				<h3>Create A New Account</h3>
				<input id='newUserUserName' class="inputItem" type=text name='newUserName' placeholder="Pick a Username" required><br>
				<input id='newUserName' class="inputItem" type=text name='newName' placeholder="Name" required><br>
				<input id='newUserEmail' class="inputItem" type=text name='newEmail' placeholder="Email-ID" required><br>
				<input id='newUserPassword' class="inputItem" type=password name='newPass' placeholder="New Password" required>
				<br><input id="newUserConfirmPassword" class="inputItem" type=password name='newConfirmPass' placeholder="Confirm Password" required><br><input type="submit" value="Create" class="btn">
			</form>	
		</div>
	</div>

</body>
<script type="text/javascript">
	$(document).ready(function(){
		$('#userLogin').click(function(){
			$('#userPrompt').slideDown();
			$('#createAccountPrompt').css("display","none");
		});
		$('#createAccount').click(function(){
			$('#userPrompt').css("display","none");
			$('#createAccountPrompt').slideDown();
		}); 
	});
</script>
</html>

