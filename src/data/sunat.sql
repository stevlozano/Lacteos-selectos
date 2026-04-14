CREATE TABLE tipo_operacion_detraccion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

INSERT INTO tipo_operacion_detraccion (codigo, descripcion) VALUES
('1001', 'Operación sujeta al Sistema de Pago de Obligaciones Tributarias con el Gobierno Central'),
('1002', 'Operación sujeta al Sistema de Pago de Obligaciones Tributarias con el Gobierno Central - Recursos Hidrobiológicos'),
('1003', 'Operación sujeta al Sistema de Pago de Obligaciones Tributarias con el Gobierno Central - Servicio de Transporte de Pasajeros'),
('1004', 'Operación sujeta al Sistema de Pago de Obligaciones Tributarias con el Gobierno Central - Servicio de Transporte de Carga');




CREATE TABLE medio_pago_detraccion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL,
    descripcion VARCHAR(255) NOT NULL
);

INSERT INTO medio_pago_detraccion (codigo, descripcion) VALUES
('001', 'Depósito en cuenta'),
('002', 'Giro'),
('003', 'Transferencia de fondos'),
('004', 'Orden de pago'),
('005', 'Tarjeta de débito'),
('006', 'Tarjeta de crédito emitida en el país por una empresa del sistema financiero'),
('007', 'Cheques con la cláusula de NO NEGOCIABLE, INTRANSFERIBLES, NO A LA ORDEN'),
('008', 'Efectivo, por operaciones en las que no existe obligación de utilizar medio de pago'),
('009', 'Efectivo, en los demás casos'),
('010', 'Medios de pago usados en comercio exterior'),
('011', 'Documentos emitidos por las EDPYMES y cooperativas no autorizadas'),
('012', 'Tarjeta de crédito emitida en el exterior'),
('013', 'Tarjetas de crédito emitidas en el exterior por empresas no domiciliadas'),
('101', 'Transferencias - Comercio exterior'),
('102', 'Cheques bancarios - Comercio exterior'),
('103', 'Orden de pago simple - Comercio exterior'),
('104', 'Orden de pago documentario - Comercio exterior');
('105', 'Remesa simple - Comercio exterior');
('106', 'Remesa documentario - Comercio exterior');
('107', 'Carta de crédito simple - Comercio exterior');
('108', 'Carta de crédito documentario - Comercio exterior');
('999', 'Otros medios de pago');