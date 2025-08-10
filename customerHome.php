<?php
	session_start(); 
	if(isset($_SESSION['loginUser'])){
		echo "<title>".$_SESSION['loginUser']."</title>";
	}
	else{
		header("Location:logout.php");
	}

?>
<!DOCTYPE html>
<html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<head>
	<link rel='stylesheet' href="style.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<style>
.Login11{
     width:100px;
     height:100px;
     border-radius:50%;
     position:absolute;
     top:-51px;
     left:calc(50% - 55px);
}

</style>

</head> 

<body background="a.png">
	<div class="topStyle">
		<h2 style="color:ghostwhite;">&nbsp &nbspGrocigo</h2>
		<a class='userNameDisplay'><?php echo $_SESSION['loginUser']; ?></a>
		<div class="solid"></div>
	</div>
	<div class='sidebar'>
		<button onclick="location.href='customerHome.php'">Home</button>
		<button onclick="location.href='viewProductsCustomer.php'">View Products</button>
		<button onclick="location.href='order.php'">Order</button>
		<button onclick="location.href='cart.php'">Cart</button>
		<button onclick="location.href='customerViewTransactions.php'">My Transactions</button>
		<button onclick="location.href='logout.php'">Logout</button>
	</div>
<div class='container'>

	<fieldset><legend><b>Options :</b></legend>
<p> - View Products
- Order Products
- View Transactions
</p>
</fieldset>



</div>
</body>
</html>