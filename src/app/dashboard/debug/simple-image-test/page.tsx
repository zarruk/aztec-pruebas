const handleUpload = async () => {
  // ... código existente ...
  
  try {
    // ... código existente ...
    
    // Subir archivo y obtener URL pública
    // ... código existente ...
    
    // Probar inserción en la tabla talleres con ID seguro
    if (uploadedUrl) {
      addLog("Probando inserción en tabla talleres...");
      
      // Generar un ID seguro (máximo 7 dígitos)
      const safeId = Date.now() % 10000000;
      addLog(`Usando ID seguro: ${safeId}`);
      
      try {
        const { data: tallerData, error: tallerError } = await supabase
          .from('talleres')
          .insert({
            id: safeId,
            nombre: `Test imagen ${new Date().toLocaleTimeString()}`,
            descripcion: "Prueba de imagen",
            tipo: "vivo",
            imagen_url: uploadedUrl,
            precio: 99000,
            capacidad: 20,
            video_url: "https://example.com/video",
          })
          .select();
        
        if (tallerError) {
          throw tallerError;
        }
        
        addLog(`Taller creado exitosamente con ID: ${tallerData[0].id}`);
        
        // Verificar que la URL se guardó correctamente
        const { data: verificacion, error: verificacionError } = await supabase
          .from('talleres')
          .select('imagen_url, video_url')
          .eq('id', tallerData[0].id)
          .single();
        
        if (verificacionError) {
          throw verificacionError;
        }
        
        addLog(`URL de imagen guardada en DB: ${verificacion.imagen_url}`);
        addLog(`URL de video guardada en DB: ${verificacion.video_url}`);
        
        if (verificacion.imagen_url === uploadedUrl) {
          addLog("✅ La URL de imagen se guardó correctamente");
        } else {
          addLog("❌ La URL de imagen guardada no coincide con la URL original");
        }
      } catch (dbError: any) {
        addLog(`ERROR en DB: ${dbError.message}`);
      }
    }
    
  } catch (error: any) {
    // ... manejo de errores ...
  }
}; 