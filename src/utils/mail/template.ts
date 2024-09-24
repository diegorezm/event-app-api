const template = ({
  title,
  obs,
  token,
}: {
  title: string;
  token: string;
  obs?: string;
}) => {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body>
    <h1>${title}</h1>
    <h2>Código</h2>
    <pre><p><strong>${token}</strong></p></pre>
    ${obs ?? ""}
  </body>
  </html>
`;
};

export default template;