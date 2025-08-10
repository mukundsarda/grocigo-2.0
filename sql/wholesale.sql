SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `cart` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `customer_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `cart` (`product_id`, `product_name`, `quantity`, `price`, `customer_id`) VALUES
(2, 'Pepsi', 71, 2485, 'akash');

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `categories` (`category_id`, `category_name`) VALUES
(1, 'Cold Drinks'),
(2, 'Biscuits and Cookies'),
(3, 'Chips and Wafers'),
(4, 'Dairy'),
(5, 'Frozen Products'),
(6, 'Fruits and Vegetables'),
(7, 'Home Needs');

CREATE TABLE `customer` (
  `cust_id` varchar(20) NOT NULL,
  `cust_name` varchar(25) NOT NULL,
  `email_id` varchar(25) NOT NULL,
  `password` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `customer` (`cust_id`, `cust_name`, `email_id`, `password`) VALUES
('mukund', 'Mukund Sarda', 'mukundsarda@gmail.com', 'mukundsarda'),
('akash', 'Akash Sharma', 'akashsharma@gamil.com', 'akashsharma'),
('karanjot', 'Karanjot Singh', 'karanjotsingh@gmail.com', 'karanjot');

CREATE TABLE `depleted_products` (
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(20) DEFAULT NULL,
  `quantity_left` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(20) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `price` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `products` (`product_id`, `product_name`, `category_id`, `price`, `quantity`) VALUES
(1, 'Coca Cola', 1, 40, 11),
(2, 'Pepsi', 1, 35, 35),
(3, 'Maaza', 1, 35, 50),
(4, 'Sprite', 1, 20, 20),
(5, 'Good Day', 2, 20, 20),
(6, 'Unibic', 2, 30, 70),
(7, 'Hide n Seek', 2, 20, 100),
(8, 'Oreo', 2, 40, 70),
(9, 'Bingo Mad Angles', 3, 10, 100),
(10, 'Lays', 3, 20, 95),
(11, 'Kurkure', 3, 20, 100),
(12, 'Kurkure Puffcorn', 3, 20, 50),
(13, 'Parle-G', 2, 10, 50),
(14, '7-Up', 1, 30, 30),
(15, 'Fanta', 1, 35, 100),
(16, 'Mirinda', 1, 30, 80),
(17, 'Mountain Dew', 1, 40, 100),
(18, 'Milk', 4, 55, 90),
(19, 'Eggs', 4, 30, 80),
(20, 'Curd', 4, 20, 100),
(21, 'Cheese', 4, 60, 110),
(22, 'French Fries', 5, 120, 50),
(23, 'Ice Cream', 5, 70, 90),
(24, 'Frozen Peas', 5, 55, 70),
(25, 'Chicken Nuggets', 5, 145, 50),
(26, 'Banana', 6, 60, 40),
(27, 'Apple', 6, 90, 55),
(28, 'Cucumber', 6, 30, 30),
(29, 'Potato', 6, 25, 60),
(30, 'Broom', 7, 105, 10),
(31, 'Scisscor', 7, 35, 25),
(32, 'Bulb', 7, 45, 15),
(33, 'Pen', 7, 10, 30);

DELIMITER $$
CREATE TRIGGER `depleted` AFTER UPDATE ON `products` FOR EACH ROW BEGIN
IF(new.quantity<=10) THEN
if (new.product_id not in (select product_id from   depleted_products)) THEN
INSERT INTO depleted_products 				  VALUES(new.product_id,new.product_name,new.quantity);
ELSE
update depleted_products set quantity_left=new.quantity where product_id=new.product_id;
end if;
ELSE
delete from depleted_products where product_id=new.product_id;
end if;
END
$$
DELIMITER ;

CREATE TABLE `transaction` (
  `transaction_id` int(11) NOT NULL,
  `customer_id` varchar(20) DEFAULT NULL,
  `transaction_amount` int(11) DEFAULT NULL,
  `payment` varchar(20) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `date` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `transaction` (`transaction_id`, `customer_id`, `transaction_amount`, `payment`, `phone`, `address`, `date`) VALUES
(0, 'akash', 600, 'COD', '8787', 'sdsd', '2019-03-28');

ALTER TABLE `cart`
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `product_id` (`product_id`);

ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

ALTER TABLE `customer`
  ADD PRIMARY KEY (`cust_id`),
  ADD UNIQUE KEY `email_id` (`email_id`);

ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `category_id` (`category_id`);

ALTER TABLE `transaction`
  ADD PRIMARY KEY (`transaction_id`);

ALTER TABLE `transaction`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`cust_id`);
  
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;