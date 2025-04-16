app.post('/api/admin/properties/:id/videos', (req, res) => {
  const propertyId = req.params.id;
  
  // Log para depurar o conteúdo da requisição
  console.log('Recebendo requisição POST para vídeos:');
  console.log('Parâmetros:', req.params);
  console.log('Body:', req.body);
  
  try {
    const { videos } = req.body;
    
    console.log(`Recebendo requisição para adicionar vídeos ao imóvel ${propertyId}:`, videos);
    
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      console.log('Nenhum vídeo válido recebido');
      return res.status(400).json({ error: 'Nenhum vídeo válido enviado' });
    }
    
    // Verificar se o imóvel existe
    db.get('SELECT * FROM properties WHERE id = ?', [propertyId], (err, property) => {
      if (err) {
        console.error('Erro ao verificar imóvel:', err);
        return res.status(500).json({ error: 'Erro ao verificar imóvel' });
      }
      
      if (!property) {
        console.log(`Imóvel ${propertyId} não encontrado`);
        return res.status(404).json({ error: 'Imóvel não encontrado' });
      }
      
      // Inserir os vídeos no banco
      try {
        const insertVideoStmt = db.prepare('INSERT INTO property_videos (property_id, video_url, title) VALUES (?, ?, ?)');
        
        const videoRecords = [];
        
        videos.forEach(video => {
          if (!video || !video.url) {
            console.log('Vídeo inválido encontrado, pulando:', video);
            return;
          }
          
          console.log(`Inserindo vídeo: ${video.url} - ${video.title || 'Sem título'}`);
          insertVideoStmt.run(propertyId, video.url, video.title || '');
          videoRecords.push({ 
            video_url: video.url, 
            title: video.title || ''
          });
        });
        
        insertVideoStmt.finalize();
        
        console.log(`${videoRecords.length} vídeos adicionados com sucesso ao imóvel ${propertyId}`);
        
        res.status(200).json({
          success: true,
          message: `${videoRecords.length} vídeos adicionados com sucesso`,
          property_id: propertyId,
          videos: videoRecords
        });
      } catch (error) {
        console.error('Erro ao inserir vídeos:', error);
        res.status(500).json({ error: 'Erro ao salvar vídeos', details: error.message });
      }
    });
  } catch (error) {
    console.error('Erro ao processar requisição de vídeos:', error);
    res.status(400).json({ error: 'Erro ao processar requisição', details: error.message });
  }
}); 