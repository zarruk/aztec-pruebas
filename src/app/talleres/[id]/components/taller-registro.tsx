// Preparar fechas disponibles para selección
const fechasDisponibles = taller.fechas 
  ? taller.fechas.map((fechaStr, index) => {
      console.log("Fecha original:", fechaStr);
      const fecha = new Date(fechaStr);
      console.log("Fecha convertida:", fecha);
      return {
        id: fechaStr,
        label: format(fecha, "EEEE d 'de' MMMM, h:mm a", { locale: es })
      };
    })
  : [];

console.log("Fechas disponibles:", fechasDisponibles);

const onSubmit = async (data: FormDataBase | FormDataVivo) => {
  setIsSubmitting(true);
  setSubmitError(null);

  try {
    console.log("Datos del formulario:", data);
    
    // Preparar datos para insertar
    const registroData = {
      taller_id: taller.id,
      ...data,
      referido_por: referidoPor,
      created_at: new Date().toISOString()
    };
    
    console.log("Datos a insertar:", registroData);

    // Insertar en la base de datos
    const { data: responseData, error } = await supabase
      .from('registros')
      .insert(registroData);
      
    console.log("Respuesta:", { data: responseData, error });

    if (error) throw new Error(error.message);

    // Mostrar mensaje de éxito
    setSubmitSuccess(true);
  } catch (error) {
    console.error('Error al registrar:', error);
    setSubmitError(error instanceof Error ? error.message : 'Error al procesar el registro');
  } finally {
    setIsSubmitting(false);
  }
}; 