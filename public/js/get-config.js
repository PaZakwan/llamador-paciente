export const obtenerConfig = async () => {
  try {
    const urlConfig = new URL("./config.json", import.meta.url).href;

    const response = await fetch(urlConfig);
    if (!response.ok) {
      // console.log("response", response);
      throw new Error(`Error en la peticion: ${response.status}`);
    }

    const data = await response.json();
    // console.log("obtenerConfig", data);
    return data;
  } catch (error) {
    console.error("Hubo un problema al obtener config:", error);
  }
};
