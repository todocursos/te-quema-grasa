// services/APISheet.js
// Ejemplo de cómo consumir una Google Sheet pública desde el frontend usando fetch


const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID // Debe estar en tu .env
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY // Debe estar en tu .env
const RANGE1 = "'cursos'!A1:BBn" // Ajusta el rango según tus datos
const RANGE2 = "'redes sociales'!A1:C100"


async function getSheetData(slug) {
  //BUSCAMOS PRIMERO SI EL SLUG COINCIDE CON ALGUNA FILA
  let slugData = await findRowBySlug(slug, SHEET_ID, API_KEY)

  console.log("slugData: ", slugData)


  // ahora si hacemos la consulta normal
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchGet?ranges=${RANGE1.replace("n", slugData)}&ranges=${RANGE2}&key=${API_KEY}`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error('Error al obtener los datos de Google Sheets')
  }

  const data = await response.json()
  console.log("respuesta: ", data)
  // data.values es un array de arrays, cada subarray es una fila
  return [
    parseSheetData(data.valueRanges[0].values)
    , parseSheetData(data.valueRanges[data.valueRanges.length -1].values)
  ]
}

function parseSheetData(sheetData) {
  // Asumiendo que la primera fila contiene los encabezados 
  const headers = sheetData[0]
  return sheetData.slice(sheetData.length -1).map(row => {
    const rowData = {}
    headers.forEach((header, index) => {
      rowData[header] = row[index]
    })
    return rowData
  })
}

async function findRowBySlug(slug) {
  console.log("Buscando slug: ", slug)
  const column = "AW"; // Columna donde buscar
  const range = `${column}:${column}`; // Toda la columna AW

  // 1. Obtener todos los valores de la columna AW
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();
  console.log("Datos de la columna: ", data)

  if (!data.values) return null;

  // const values = data.values.flat(); // Asegurarse de tener un array plano

  // 2. Buscar la coincidencia exacta del slug
  let rowNumber = null;

  for (let i = 0; i < data.values.length; i++) {
    if (data.values[i][0].trim().toLowerCase() === slug.trim().toLowerCase()) {
      rowNumber = i + 1; // +1 porque Sheets empieza en 1
      break;
    }
  }

  console.log("Número de fila encontrado: ", rowNumber)

  if (!rowNumber) {
    return null; // No encontrado
  }

  return rowNumber;
}



export { getSheetData }
