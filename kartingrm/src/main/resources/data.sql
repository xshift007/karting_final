CREATE TABLE IF NOT EXISTS rate_pricing(
   rate      VARCHAR(20) NOT NULL,
   category  VARCHAR(20) NOT NULL,
   price     DOUBLE      NOT NULL,
   minutes   INT         NOT NULL,
   PRIMARY KEY(rate, category)
);

INSERT INTO rate_pricing(rate,category,price,minutes) VALUES
('LAP_10','WEEKDAY',15000,30),
('LAP_10','WEEKEND',20000,30),
('LAP_10','HOLIDAY',25000,30),
('LAP_15','WEEKDAY',20000,35),
('LAP_15','WEEKEND',25000,35),
('LAP_15','HOLIDAY',30000,35),
('LAP_20','WEEKDAY',25000,40),
('LAP_20','WEEKEND',30000,40),
('LAP_20','HOLIDAY',35000,40);

-- la tabla HOLIDAYS existente se queda como estaba

INSERT INTO holidays (date, name) VALUES
                                      ('2025-09-18', 'Fiestas Patrias'),
                                      ('2025-12-25', 'Navidad');
