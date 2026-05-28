--1. Redactar una consulta que retorne, para todas las ventas realizadas en el año 2023:
--El peso total de los productos vendidos en cada venta (resultado de Cantidad * Peso del producto, sumado
--por venta), el total de la venta, la razón social del cliente y clasificar agregando una nueva columna, llamada
--CostoDeEnvio, según lo siguiente:
--● Hasta 10 kg : 0
--● Más de 10 kg hasta 50 kg : 1.000
--● Más de 50 kg hasta 100 kg : 5.000
--● Más de 100 kg hasta 200 kg : 10.000
--● Más de 200 kg : 15.000

SELECT 
	v.VentaID,	
	v.Total,
	c.RazonSocial,
	SUM(vp.Cantidad * p.Peso) AS PesoTotal,
	CASE 
		WHEN SUM(vp.Cantidad * p.Peso) <= 10 THEN 0
		WHEN SUM(vp.Cantidad * p.Peso) > 10 AND SUM(vp.Cantidad * p.Peso) <= 50 THEN 1000
		WHEN SUM(vp.Cantidad * p.Peso) > 50 AND SUM(vp.Cantidad * p.Peso) <= 100 THEN 5000
		WHEN SUM(vp.Cantidad * p.Peso) > 100 AND SUM(vp.Cantidad * p.Peso) <= 200 THEN 10000
		ELSE 15000
	END AS CostoDeEnvio
FROM VentasProductos vp
INNER JOIN Ventas v ON vp.VentaID = v.VentaID
INNER JOIN Clientes c ON v.ClienteID = c.ClienteID
INNER JOIN Productos p ON vp.ProductoID = p.ProductoID
WHERE v.Fecha BETWEEN '2023-01-01' AND '2023-12-31'
GROUP BY v.VentaID, 
		 v.Total, 
		 c.RazonSocial
GO

--2. Redactar una consulta que devuelva el listado de productos nacionales cuyo precio sea mayor al precio
--promedio de todos los productos importados.
--La consulta debe mostrar los siguientes campos:
--● Código del producto (Codigo),
--● Nombre del producto (Nombre),
--● Nombre de la marca (Marca),
--● Precio del producto (Precio)

SELECT 
	p.Codigo,
	p.Nombre,
	m.Marca,
	p.Precio
FROM Productos p
INNER JOIN Marcas m ON p.MarcaID = m.MarcaID
WHERE p.Origen = 'N' AND p.Precio > (SELECT AVG(Precio) FROM Productos WHERE Origen = 'I')
GO


--3. Redactar una consulta que devuelva un listado de todos los empleados que ocupan el puesto de vendedor
--(PuestoID = 3), junto con la cantidad de ventas que realizaron. Utilizar una subconsulta correlacionada para
--contar las ventas de cada empleado vendedor.
--Se deben mostrar los siguientes campos:
--● Apellido del empleado (Apellido)
--● Nombre del empleado (Nombre)
--● Cantidad total de ventas realizadas (Cantidad)

SELECT 
	e.Apellido,
	e.Nombre,
	(SELECT COUNT(*) FROM Ventas v WHERE v.EmpleadoID = e.EmpleadoID) AS Cantidad
FROM Empleados e
WHERE e.PuestoID = 3
GO

--4. Crear un trigger sobre la tabla VentasProductos para la acción de eliminación que realice lo siguiente: si se
--borra un registro de la tabla VentasProductos, se debe actualizar el stock del producto correspondiente,
--sumando el valor de la columna cantidad del registro eliminado al stock del producto.

CREATE TRIGGER TR_DelVentasProducto_Stock
ON VentasProductos
AFTER DELETE
AS
BEGIN
	UPDATE p
	SET p.Stock = p.Stock + d.Cantidad
	FROM Productos p
	INNER JOIN deleted d ON p.ProductoID = d.ProductoID
END
GO


--5. Crear un trigger para la acción de inserción en la tabla Empleados que verifique si existe el número de legajo
--indicado no permita la carga del empleado.

-- CON AFTER
CREATE TRIGGER TR_InsEmpleados_Legajo
ON Empleados
AFTER INSERT
AS
BEGIN
	IF (SELECT COUNT(*) FROM Empleados e INNER JOIN inserted i ON e.Legajo = i.Legajo) > 1
	BEGIN
		RAISERROR('El número de legajo ya existe. No se puede insertar el empleado.', 16, 1)
		ROLLBACK TRANSACTION
	END
END
GO

-- CON INSTEAD OF
CREATE TRIGGER TR_InsEmpleados_Legajo
ON Empleados
INSTEAD OF INSERT
AS
BEGIN
	IF (SELECT COUNT(*) FROM Empleados e INNER JOIN inserted i ON e.Legajo = i.Legajo) > 0
	BEGIN
		RAISERROR('El número de legajo ya existe. No se puede insertar el empleado.', 16, 1)
	END
	ELSE
	BEGIN
		INSERT INTO Empleados 
		SELECT	Legajo, 
				Apellido, 
				Nombre, 
				NroDoc,
				Cuil,
				Sexo,
				Domicilio,
				CiudadID,
				TelPers,
				EmailLab,
				EmailPers,
				FechaNac,
				FechaIngreso,
				Comision,
				Sueldo,
				JefeID,
				PuestoID,
				HorasJornada,
				FechaBaja,
				EsActivo 
		FROM inserted
	END
END