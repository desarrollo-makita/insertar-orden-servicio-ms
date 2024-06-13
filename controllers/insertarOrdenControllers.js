const axios = require('axios');
const logger = require('../config/logger.js');
const { connectToDatabase, closeDatabaseConnection } = require('../config/database.js');
const sql = require('mssql');
const moment = require('moment');

/**
 * Funcion qe consulta si el servicio pedido existe en las base de datos de makita
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function insertarOrden(req , res){
    try{
        logger.info(`Iniciamos la funcion insertarOrdenServicio`);
        let result;
        
        console.log("req: " , req.body);
        
        if (!req.body) {
            logger.error(`Error: los parametros de entrada son incorrectos`);
            return res.status(400).json({ error: `Parámetros faltantes o vacíos` });
        }
        const data =  req.body;

        // Conectarse a la base de datos 'telecontrol'
        await connectToDatabase('Telecontrol');

         // Armamos data que vamos a mandar al procedimiento almacenado
        for (const ordenServicio of data) {
            const request = new sql.Request(); // Nueva instancia de request en cada iteración
            
            const {
                os: ID_OS,
                idPedido: Folio,
                codigo_posto   : Entidad,
                cnpj: CodigoServicioAut,
                nome: NombreServicioAut,
                data_abertura: FechaAbertura,
                defeito_reclamado_descricao: DescripcionDefecto,
                data_digitacao: FechaDigitalizacion,
                consumidor_fone_comercial: FonoConsumidor,
                consumidor_email: EmailConsumidor,
                consumidor_endereco: DireccionConsumidor,
                consumidor_numero: NumeroConsumidor,
                consumidor_bairro: BarrioConsumidor,
                consumidor_complemento: ComplementoConsumidor,
                consumidor_cep: CepConsumidor,
                consumidor_cidade: CiudadConsumidor,
                consumidor_estado: RegionConsumidor,
                data_fechamento: FechaCierre,
                os_reincidente: OSReincidente,
                referencia: Referencia,
                descricao: DescripcionHerramienta,
                serie: Serie,
                data_fabricacao: FechaFabricacion,
                defeito_reclamado: DefectoReclamado,
                defeito_constatado: DefectoConstatado,
                solucao: Solucion,
                consumidor_nome: NombreConsumidor,
                consumidor_fone: FonoComercialConsumidor,
                consumidor_cpf: CpfConsumidor,
                revenda: Revendedor,
                nota_fiscal: NotaFiscal,
                data_nf: DataNF,
                status_os: StatusOS,
                local_reparo: LocalReparo,
                dias_aberto: DiasAbiertos
            } = ordenServicio;

            // Ejecutar el procedimiento almacenado con los parámetros
              result = await request
                .input('ID_OS', sql.VarChar(20), ID_OS.toString())
                .input('Empresa', sql.VarChar(20), "Makita")
                .input('Folio', sql.Int, ordenServicio.idPedido)
                .input('Entidad', sql.VarChar(50), Entidad.trim())
                .input('CodigoServicioAut', sql.VarChar(50), CodigoServicioAut)
                .input('NombreServicioAut', sql.VarChar(100), NombreServicioAut)
                .input('FechaAbertura', sql.VarChar, formatDate(FechaAbertura) )
                .input('DescripcionDefecto', sql.VarChar(sql.MAX),DescripcionDefecto)
                .input('FechaDigitalizacion', sql.VarChar, formatDate(FechaDigitalizacion))
                .input('FonoConsumidor', sql.VarChar(20), FonoConsumidor)
                .input('EmailConsumidor', sql.VarChar(100), EmailConsumidor)
                .input('DireccionConsumidor', sql.VarChar(100), DireccionConsumidor)
                .input('NumeroConsumidor', sql.VarChar(20), NumeroConsumidor)
                .input('ComplementoConsumidor', sql.VarChar(50), ComplementoConsumidor)
                .input('BarrioConsumidor', sql.VarChar(50), BarrioConsumidor)
                .input('CepConsumidor', sql.VarChar(20), CepConsumidor.trim())
                .input('CiudadConsumidor', sql.VarChar(50), CiudadConsumidor)
                .input('RegionConsumidor', sql.VarChar(50), RegionConsumidor)
                .input('FechaCierre', sql.VarChar, formatDate(FechaCierre))
                .input('OSReincidente', sql.Bit, OSReincidente)
                .input('Referencia', sql.VarChar(100), Referencia)
                .input('DescripcionHerramienta', sql.VarChar(sql.MAX), DescripcionHerramienta)
                .input('Serie', sql.VarChar(50), Serie)
                .input('FechaFabricacion', sql.VarChar,  formatDate(FechaFabricacion))
                .input('DefectoReclamado', sql.VarChar(sql.MAX), DefectoReclamado)
                .input('DefectoConstatado', sql.VarChar(sql.MAX), DefectoConstatado)
                .input('Solucion', sql.VarChar(sql.MAX), Solucion)
                .input('NombreConsumidor', sql.VarChar(100), NombreConsumidor)
                .input('FonoComercialConsumidor', sql.VarChar(20), FonoComercialConsumidor)
                .input('CpfConsumidor', sql.VarChar(20), CpfConsumidor)
                .input('Revendedor', sql.VarChar(100), Revendedor)
                .input('NotaFiscal', sql.VarChar(50), NotaFiscal)
                .input('DataNF', sql.DateTime, formatDate(DataNF))
                .input('StatusOS', sql.VarChar(50), StatusOS)
                .input('LocalReparo', sql.VarChar(20), LocalReparo)
                .input('DiasAbiertos', sql.Int, DiasAbiertos)
                .output('Correlativo', sql.Int)
                .output('Insertado', sql.Int)
                .output('ResultadoID', sql.VarChar)
                .execute('OrdenServicio');

                
        }

        result.ID_OS =  result.ID_OS
        logger.info(`Fin la funcion insertarOrdenServicio ${JSON.stringify(result)}`);
       
        return  res.status(200).json(result.recordset);
     
    }catch (error) {
        console.log("error: " , error);
        // Manejamos cualquier error ocurrido durante el proceso
        logger.error(`Error en insertarOrden: ${error.message}`);
        res.status(500).json({ error: `Error en el servidor [insertar-orden-service-ms] :  ${error.message}`  });
    }finally{
        await closeDatabaseConnection();
    }
}

// Formateamos fecha para procedimiento almacenado
function formatDate(date) {
    
    if(date != null){
        const fechaMoment = moment(date, "DD-MM-YYYY");
        const fechaFormateada = fechaMoment.format("YYYY-MM-DD");
        return fechaFormateada;
    }
}
module.exports = {
    insertarOrden
};
