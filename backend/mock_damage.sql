USE car_rental_db;

-- 1. Completed booking WITH existing damage compensation
INSERT INTO reservation (reserve_date, pickup_date, return_date, pickup_location, refund_amount, refund_percentage, tax_percentage, tax_amount, cust_id, vehicle_id)
VALUES 
('2026-05-15', '2026-05-16', '2026-05-18', 'Bangalore - Airport', 0, 0, 18, 432, 3, 1);

-- Get the ID of the reservation we just inserted (should be 3)
SET @res_id_with_damage = LAST_INSERT_ID();

INSERT INTO rent (pay_method, down_payment, refund, damage_compensation, damage_description, amount_paid, extra_charges, pending_amount, total_pay, pay_date, cust_id, vehicle_id, reserve_id)
VALUES
('Card', 2832, 0, 50000, 'Front bumper scratched deeply', 2832, 0, 50000, 52832, '2026-05-15', 3, 1, @res_id_with_damage);

-- 2. Completed booking WITHOUT damage compensation (ready for the user to add it)
INSERT INTO reservation (reserve_date, pickup_date, return_date, pickup_location, refund_amount, refund_percentage, tax_percentage, tax_amount, cust_id, vehicle_id)
VALUES 
('2026-05-10', '2026-05-11', '2026-05-12', 'Mysore - Palace', 0, 0, 18, 216, 3, 1);

-- Get the ID of the reservation we just inserted (should be 4)
SET @res_id_clean = LAST_INSERT_ID();

INSERT INTO rent (pay_method, down_payment, refund, damage_compensation, damage_description, amount_paid, extra_charges, pending_amount, total_pay, pay_date, cust_id, vehicle_id, reserve_id)
VALUES
('Online', 1416, 0, 0, NULL, 1416, 0, 0, 1416, '2026-05-10', 3, 1, @res_id_clean);
