// import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-muted mt-16 py-8">
      <div className="container mx-auto px-4 text-center space-y-4">
        <div className="flex justify-center gap-6 text-sm">
          {/* <Link 
            to="/sorteio" 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sorteio
          </Link> */}
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Desenvolvido por <span className="font-semibold text-foreground">Mink</span></p>
          <p>© {currentYear} - Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
}