DECLARE DemoCursor CURSOR FOR
SELECT Legajo, Apellido, Nombre, Sueldo FROM Empleados

DECLARE @legajo int, @apellido varchar(50), @nombre varchar(50), @sueldo numeric(18,2)

OPEN DemoCursor;

FETCH NEXT FROM DemoCursor INTO @legajo, @apellido, @nombre, @sueldo; 

WHILE @@FETCH_STATUS = 0 
BEGIN

    PRINT CONCAT(@legajo,'- ', @apellido, ', ', @nombre, ' - ', @sueldo)

    FETCH NEXT FROM DemoCursor INTO @legajo, @apellido, @nombre, @sueldo
END;

CLOSE DemoCursor;
DEALLOCATE DemoCursor;
GO

-----------------------------------------------------------------------------------------------------------

DECLARE DemoCursor CURSOR FOR
SELECT VentaID, sum(Cantidad * Precio)
FROM VentasProductos
group by VentaID


DECLARE @ventaid int, @total numeric(18,2);

OPEN DemoCursor;

FETCH NEXT FROM DemoCursor INTO @ventaid, @total; 

WHILE @@FETCH_STATUS = 0 
BEGIN

    update Ventas set Total = @total where VentaID = @ventaid

    FETCH NEXT FROM DemoCursor INTO @ventaid, @total;
END;

CLOSE DemoCursor;
DEALLOCATE DemoCursor;
GO
------------------------------------------------------------------------------------------------------------

DECLARE DemoCursor CURSOR FOR

SELECT  Ventaid, 
        Fecha, 
        Total 
FROM Ventas
WHERE Fecha >= '2023-01-01' and Fecha < '2023-12-31'
ORDER BY Fecha 

DECLARE @ventaid int, 
        @fecha date, 
        @total numeric(18,2), 
        @acumulado numeric(18,2) = 0; 

OPEN DemoCursor;

FETCH NEXT FROM DemoCursor INTO @ventaid, @fecha, @total; 

WHILE @@FETCH_STATUS = 0 
BEGIN

    SET @acumulado = @acumulado + @total

    SELECT @ventaid as VentaID, @fecha as Fecha, @total as Total, @acumulado as Acumulado

    FETCH NEXT FROM DemoCursor INTO @ventaid, @fecha, @total
END;

CLOSE DemoCursor;
DEALLOCATE DemoCursor;
GO