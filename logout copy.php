<?php
  session_start();
  session_unset();
  session_destroy();
  $_SESSION = array();
  header("Location:loginPage.php");
?>
<!-- For the static version, use logout.html instead. -->
