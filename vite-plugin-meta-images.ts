import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { loadEnv } from 'vite';

export function metaImagesPlugin(): Plugin {
  return {
    name: 'vite-plugin-meta-images',
    // O Vite nos dá o contexto (ctx) para saber se é dev ou build
    transformIndexHtml(html, ctx) {
      // Carrega as variáveis de ambiente atuais
      const env = loadEnv(ctx.server ? 'development' : 'production', process.cwd(), '');
      
      // Buscamos a URL definida no .env. Se não tiver, usamos localhost como fallback
      const baseUrl = env.VITE_SITE_URL;

      if (!baseUrl) {
        console.warn('[meta-images] VITE_SITE_URL não definida no .env. As tags de meta imagem não serão atualizadas.');
        return html;
      }

      // Agora a pasta public fica na raiz do projeto, não em client/public
      const publicDir = path.resolve(process.cwd(), 'public');
      const opengraphPngPath = path.join(publicDir, 'opengraph.png');
      const opengraphJpgPath = path.join(publicDir, 'opengraph.jpg');
      const opengraphJpegPath = path.join(publicDir, 'opengraph.jpeg');

      let imageExt: string | null = null;
      if (fs.existsSync(opengraphPngPath)) {
        imageExt = 'png';
      } else if (fs.existsSync(opengraphJpgPath)) {
        imageExt = 'jpg';
      } else if (fs.existsSync(opengraphJpegPath)) {
        imageExt = 'jpeg';
      }

      if (!imageExt) {
        // Se não tiver imagem, não faz nada silenciosamente
        return html;
      }

      // Remove a barra final da URL se o usuário colocou (ex: .com.br/ virou .com.br)
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const imageUrl = `${cleanBaseUrl}/opengraph.${imageExt}`;

      // Substitui as tags no HTML
      html = html.replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/g,
        `<meta property="og:image" content="${imageUrl}" />`
      );

      html = html.replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/g,
        `<meta name="twitter:image" content="${imageUrl}" />`
      );

      return html;
    },
  };
}
