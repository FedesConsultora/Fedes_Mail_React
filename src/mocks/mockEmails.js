const mockEmails = {
    emails: [
      {
        id: 1,
        fecha: "2024-04-13 10:15:00",
        de: "soporte@fedes.ai",
        asunto: "Bienvenido a Fedes Mail",
        contenido: "<p>Hola Federico, bienvenido a tu nueva casilla de Fedes Mail 🎉</p>",
        adjuntos: [],
        state: "unread"
      },
      {
        id: 2,
        fecha: "2024-04-12 08:30:00",
        de: "noreply@linkedin.com",
        asunto: "Conexiones sugeridas",
        contenido: "<p>Tenemos nuevas sugerencias para vos. ¡Conectate hoy!</p>",
        adjuntos: [],
        state: "read"
      },
      {
        id: 3,
        fecha: "2024-04-10 19:42:00",
        de: "giovi@gmail.com",
        asunto: "Cena el viernes?",
        contenido: "<p>¿Querés que cocine o pedimos algo? 🍝</p>",
        adjuntos: [],
        state: "unread"
      },
      {
        id: 4,
        fecha: "2024-04-08 14:23:00",
        de: "facturacion@hosting.com",
        asunto: "Factura abril",
        contenido: "<p>Adjunto se encuentra la factura correspondiente al mes de abril.</p>",
        adjuntos: [
          { id: 101, nombre: "factura_abril.pdf", mimetype: "application/pdf" }
        ],
        state: "read"
      }
    ],
    total: 4,
    page: 1,
    limit: 50
  };
  
  export default mockEmails;
  