-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: EARN_PLAZA
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `deposits`
--

DROP TABLE IF EXISTS `deposits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deposits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(100) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `proof_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `deposits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deposits`
--

LOCK TABLES `deposits` WRITE;
/*!40000 ALTER TABLE `deposits` DISABLE KEYS */;
INSERT INTO `deposits` VALUES (1,5,10.00,'Bank Transfer','fyfiyfiutf',NULL,'approved','2026-10-01 12:47:21'),(2,5,80.00,'Bank Transfer','dhtgvvuy',NULL,'approved','2026-10-01 12:51:15');
/*!40000 ALTER TABLE `deposits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_submissions`
--

DROP TABLE IF EXISTS `task_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `proof` text NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_submissions_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_submissions`
--

LOCK TABLES `task_submissions` WRITE;
/*!40000 ALTER TABLE `task_submissions` DISABLE KEYS */;
INSERT INTO `task_submissions` VALUES (1,1,1,'the 12 day war','approved','2026-08-28 13:29:04'),(2,2,1,'the man dem','approved','2026-08-28 14:11:36'),(3,3,1,'g7tqg87d','approved','2026-09-10 14:38:13'),(4,3,3,'jysvxvh','approved','2026-09-10 14:46:04'),(5,4,3,'tywfud','approved','2026-09-10 14:51:15'),(6,2,3,'khyf','approved','2026-09-16 12:22:58'),(7,1,3,'nvgcxjhgcn','approved','2026-09-16 12:23:07'),(8,2,4,'tfuy','approved','2026-09-16 12:58:01'),(9,1,4,'yjfukv','approved','2026-09-16 12:58:09'),(10,5,1,'the first world war','approved','2026-09-16 13:27:17'),(11,5,3,'BUHARI UWA NILE','approved','2026-09-16 13:35:49'),(12,5,5,'yudsgvjbhc','approved','2026-09-16 13:38:37'),(13,1,5,'dfgbxfv','approved','2026-09-16 13:39:11'),(14,2,5,'dgghted','approved','2026-09-16 13:39:26'),(15,2,6,'davdvcsfc','approved','2026-09-16 15:17:10'),(16,1,6,'eqf','pending','2026-09-16 15:17:19');
/*!40000 ALTER TABLE `task_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `reward` decimal(10,2) NOT NULL,
  `category` varchar(100) DEFAULT 'social',
  `slots` int DEFAULT '10',
  `slots_claimed` int DEFAULT '0',
  `expires_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remaining_slots` int DEFAULT '0',
  `link` varchar(500) DEFAULT NULL,
  `total_slots` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Follow on tiktok','First Video Description ',0.01,'social',10,4,NULL,NULL,'2026-08-28 13:28:26',4,'https://www.tiktok.com/@ronyxdaily/video/7528726796515167494?is_from_webapp=1&sender_device=pc&web_id=7679071896764728849',5),(2,'Like Video','First Videos Description',50.00,'social',10,4,NULL,NULL,'2026-08-28 14:11:11',2,'https://www.tiktok.com/@ronyxdaily/video/7528726796515167494?is_from_webapp=1&sender_device=pc&web_id=7679071896764728849',3),(3,'download and run the app','drop a review',0.15,'app_test',10,2,'2026-09-11 15:37:38',1,'2026-09-10 14:37:37',0,NULL,0),(4,'download and run','drop review\n',0.03,'social',10,1,'2026-09-11 15:50:55',3,'2026-09-10 14:50:54',0,NULL,0),(5,'Like the video','video title',10.00,'social',3,3,'2026-09-16 16:26:38',1,'2026-09-16 13:26:37',0,NULL,0);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `fee` decimal(10,2) DEFAULT '0.00',
  `description` text,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,1,'task_completion',0.01,0.00,'Completed: Follow on tiktok','completed','2026-08-28 13:29:51'),(2,1,'withdrawal',0.01,0.00,'Bank Transfer: Blosom 8140451854 Opay','completed','2026-08-28 13:43:41'),(3,1,'task_completion',50.00,0.00,'Completed: Like Video','completed','2026-08-28 14:11:55'),(4,1,'withdrawal',10.00,0.00,'Bank Transfer: Bank: Zenith Bank | Acc No: 2548611872 | Name: Frank Great [REJECTED & REFUNDED]','rejected','2026-08-28 14:13:15'),(5,1,'earning',0.15,0.00,'Earned from task: download and run the app','completed','2026-09-10 14:38:14'),(6,3,'earning',0.15,0.00,'Earned from task: download and run the app','completed','2026-09-10 14:46:05'),(7,3,'earning',0.03,0.00,'Earned from task: download and run','completed','2026-09-10 14:51:16'),(8,4,'earning',0.01,0.00,'Earned from task: Follow on tiktok','completed','2026-09-16 14:11:39'),(9,3,'earning',0.01,0.00,'Earned from task: Follow on tiktok','completed','2026-09-16 14:11:41'),(10,4,'earning',50.00,0.00,'Earned from task: Like Video','completed','2026-09-16 14:11:42'),(11,3,'earning',50.00,0.00,'Earned from task: Like Video','completed','2026-09-16 14:11:44'),(12,3,'earning',0.15,0.00,'Earned from task: download and run the app','completed','2026-09-16 14:11:46'),(13,1,'earning',10.00,0.00,'Earned from task: Like the video','completed','2026-09-16 14:11:48'),(14,3,'earning',0.03,0.00,'Earned from task: download and run','completed','2026-09-16 14:11:50'),(15,5,'earning',10.00,0.00,'Earned from task: Like the video','completed','2026-09-16 14:11:54'),(16,3,'earning',10.00,0.00,'Earned from task: Like the video','completed','2026-09-16 14:11:56'),(17,5,'earning',0.01,0.00,'Earned from task: Follow on tiktok','completed','2026-09-16 14:11:57'),(18,5,'earning',50.00,0.00,'Earned from task: Like Video','completed','2026-09-16 14:13:25'),(19,1,'earning',0.15,0.00,'Earned from task: download and run the app','completed','2026-09-16 14:13:27'),(20,6,'earning',50.00,0.00,'Earned from task: Like Video','completed','2026-09-16 15:17:54'),(21,6,'withdrawal',7.50,2.50,'Method: Bank Transfer | Details: Bank: Zenith Bank | Acc No: 2548611872 | Name: Frank Great | Fee: $2.50','pending','2026-09-28 20:47:18'),(22,5,'deposit',10.00,0.00,'Wallet Deposit (Ref: fyfiyfiutf)','completed','2026-10-01 12:47:36'),(23,6,'withdrawal',7.50,2.50,'Method: Bank Transfer | Details: Bank: Access Bank | Acc No: 1624485 | Name: utfdytfgj | Fee: $2.50','pending','2026-10-01 12:50:09'),(24,5,'deposit',80.00,0.00,'Wallet Deposit (Ref: dhtgvvuy)','completed','2026-10-01 12:51:46');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `referrals_count` int DEFAULT '0',
  `referred_by` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `reset_otp` varchar(6) DEFAULT NULL,
  `reset_otp_expires` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `referral_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Blossom Okolie','blossomokolie24@gmail.com','$2b$10$ypNM.OGD9NFoe1Wppsk8Eup/0Jkm4nCFkBEOEHyZB8zywXKwRPlrG',60.30,0,NULL,'user',NULL,NULL,'2026-08-28 13:18:44','blo2439X'),(2,'Blossom Baby','blomblomb320@gmail.com','$2b$10$gp0Z7x7RPa97E9JWEZEWruBBqfr0ANHdr4M6lPz0tPyEvFnuHwsS6',0.00,0,NULL,'user','654321','2026-08-30 23:59:59','2026-08-28 14:27:37','blo4467X'),(3,'Frank Great','frankgreat363@gmail.com','$2b$10$o4nghbz54PC3ASRDUAlIG.tgqNTHjoYnuMutsjOzGn7xm4QfceQj2',60.37,0,NULL,'user','980349','2026-09-18 21:05:52','2026-09-10 13:43:52','frankgreat2883'),(4,'General Zod','generalzod@gmail.com','$2b$10$7Se8MVOHgOJDgpKwEiqPduu5mqJFGiJnBrPvRIabLYzzesvY7MwNq',50.01,0,NULL,'user',NULL,NULL,'2026-09-16 12:57:13','generalzod4486'),(5,'Jericho Jackson','jeremyfurt222@gmail.com','$2b$10$DT6sXQS2o8IeZ5xh.i6b/OBkALAi6tok2GytihqiUHkSZopN9FFBa',150.01,0,NULL,'admin',NULL,NULL,'2026-09-16 13:37:50','jerichojackson3783'),(6,'Oracle Log','oraclelogistics@gmail.com','$2b$10$8pfRq5.aeAxZpEWbFU4qne93WPC37gle.iu.kl8AyUaMbVRw1kfE.',30.00,0,NULL,'user',NULL,NULL,'2026-09-16 15:15:51','oraclelog4456'),(7,'Carlos Tyler','carlostyler1992@gmail.com','$2b$10$mNKIe/c4uFDNBrbu4Q0XeOAR0ZGsPCVBgnlCfkZlpOt2oviNDthYu',0.00,0,NULL,'user',NULL,NULL,'2026-09-18 21:08:15','carlostyler9932'),(8,'Tehilah Praise','frankpraise363@gmail.com','$2b$10$USQ1ru0rG1WdA0e8R19FOeh8m3XtqW6AefaxZ5STt675zW3A5oH8q',0.00,0,'oraclelog4456','user',NULL,NULL,'2026-09-19 12:26:44','tehilahpraise2304'),(9,'Chisom Favour','convenantchisom@gmail.com','$2b$10$HXyqxfDiDOxnt2EHcjREhO5z2I.ij1KnRryIPW.DL8B6SlS0xYg8q',0.00,0,'oraclelog4456','user',NULL,NULL,'2026-09-28 20:13:46','chisomfavour4392'),(10,'General Zod','generalzod363@gmail.com','$2b$10$7KrKzsRy3WM0WOX6Mcp/9uHZuTsg.xPzogJEpd9TRiysv2BZzFCFq',0.00,0,'oraclelog4456','user',NULL,NULL,'2026-09-28 20:15:03','generalzod8578');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `withdrawals`
--

DROP TABLE IF EXISTS `withdrawals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `withdrawals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'Bank Transfer',
  `account_details` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `withdrawals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `withdrawals`
--

LOCK TABLES `withdrawals` WRITE;
/*!40000 ALTER TABLE `withdrawals` DISABLE KEYS */;
INSERT INTO `withdrawals` VALUES (1,4,10.00,'PayPal','frankgreat@gmail.com','pending','2026-08-20 15:22:38'),(2,3,10.00,'Bank Transfer','8140451854 - opay','pending','2026-08-20 23:42:43'),(3,4,10.00,'Bank Transfer','8140451854 opay','pending','2026-08-21 00:06:34'),(4,4,10.00,'Bank Transfer','8140451854 - Opay','pending','2026-08-21 00:24:27');
/*!40000 ALTER TABLE `withdrawals` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-01 15:05:28
