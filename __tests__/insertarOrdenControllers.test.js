const { insertarPedidos} = require('../controllers/insertarPedidosControllers.js');
const { connectToDatabase, closeDatabaseConnection } = require('../config/database.js');
const mock =  require('../config/mock.js')
const sql = require('mssql');

// Mockear las dependencias externas
jest.mock('../config/database.js');
jest.mock('mssql');

describe('insertarPedidos', () => {
  // Limpiar los mocks después de cada prueba
  afterEach(() => {
      jest.clearAllMocks();
  });

  it('debería ir con parametros 200', async () => {
    const req = { body: {tabla: "entidad" , codigoPosto:"16802012-0"} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Mock de la respuesta de la consulta SQL
    const mockResponse = [{ Entidad: "16802012-0", tipoEntidad: "cliente", vigencia: "S" }];
    sql.query.mockResolvedValue({ recordset: mockResponse });

    await validaPedidos(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
});

it('debería devolver un error si faltan parámetros', async () => {
  const req = { body: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  await validaPedidos(req, res);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ error: 'Parámetros faltantes o vacíos' });
});

it('entra al else donde valida que la listga sea menos a 0', async () => {
  const req = { body: {tabla: "entidad" , codigoPosto:"16802012-0"} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  // Mock de la respuesta de la consulta SQL
  const mockResponse = [];
  sql.query.mockResolvedValue({ recordset: mockResponse });

  await validaPedidos(req, res);

  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ mensaje:`La entidad 16802012-0 no se encuentra en nuestros registros` });
});

it('debería manejar excepciones correctamente', async () => {
  const req = { body: { tabla: "entidad", codigoPosto: "16802012-0" } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  // Mock para forzar un error en la consulta SQL
  const mockError = new Error("Error en la base de datos");
  sql.query.mockRejectedValue(mockError);

  await validaPedidos(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: `Error en el servidor [validar-entidad-ms] :  ${mockError.message}` });
});

});
