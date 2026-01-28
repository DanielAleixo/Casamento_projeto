// CARROSSEL PARA LAYOUT FLUTUANTE
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando carrosséis flutuantes...');
    
    // Inicializar todos os carrosséis
    const carrosseis = document.querySelectorAll('.carrossel-retrato');
    
    carrosseis.forEach(carrossel => {
        initCarrossel(carrossel);
    });
    
    function initCarrossel(carrossel) {
        const track = carrossel.querySelector('.carrossel-track');
        const slides = carrossel.querySelectorAll('.carrossel-slide');
        const prevBtn = carrossel.querySelector('.prev-btn');
        const nextBtn = carrossel.querySelector('.next-btn');
        const dots = carrossel.querySelectorAll('.dot');
        
        const totalSlides = slides.length;
        let currentIndex = 0;
        let autoPlayInterval;
        
        // Se tiver apenas 1 slide, esconder navegação
        if (totalSlides <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (carrossel.querySelector('.carrossel-dots')) {
                carrossel.querySelector('.carrossel-dots').style.display = 'none';
            }
            return;
        }
        
        // Configurar largura do track
        track.style.width = `${totalSlides * 100}%`;
        
        // Função para atualizar carrossel
        function updateCarrossel() {
            // Mover track
            const translateX = -(currentIndex * 100);
            track.style.transform = `translateX(${translateX}%)`;
            
            // Atualizar dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
            
            // Ajustar imagem atual
            ajustarImagemAtual();
        }
        
        // Ajustar imagem atual para caber no container
        function ajustarImagemAtual() {
            const slideAtual = slides[currentIndex];
            const img = slideAtual.querySelector('img');
            
            if (img) {
                // Resetar estilos
                img.style.maxHeight = '';
                img.style.maxWidth = '';
                
                // Adicionar classe
                img.classList.add('foto-retrato');
                
                // Se a imagem já carregou
                if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                    const imgRatio = img.naturalWidth / img.naturalHeight;
                    
                    // Ajustar baseado na proporção
                    if (imgRatio > 1.3) {
                        // Paisagem
                        img.style.maxWidth = '85%';
                        img.style.maxHeight = 'auto';
                    } else {
                        // Retrato ou quadrado
                        img.style.maxWidth = 'auto';
                        img.style.maxHeight = '85%';
                    }
                }
            }
        }
        
        // Ir para slide específico
        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            
            currentIndex = index;
            updateCarrossel();
        }
        
        // Função para auto-play
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 5000);
        }
        
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        // Event listeners para botões
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(currentIndex - 1);
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000); // Reinicia após 10 segundos
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(currentIndex + 1);
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
            });
        }
        
        // Event listeners para dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
            });
        });
        
        // Tratamento de erro para imagens
        slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                img.addEventListener('error', function() {
                    console.warn(`Erro ao carregar imagem ${index + 1}:`, this.src);
                    this.alt = 'Imagem não disponível';
                    
                    // Criar placeholder
                    const placeholder = document.createElement('div');
                    placeholder.className = 'placeholder-imagem';
                    placeholder.innerHTML = `
                        <div style="
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            background: linear-gradient(135deg, #f7cac9, #b19cd9);
                            color: white;
                            border-radius: 6px;
                            padding: 20px;
                            text-align: center;
                        ">
                            <span style="font-size: 2.5rem;">💖</span>
                            <p style="margin-top: 10px; font-weight: 600;">Foto ${index + 1}</p>
                            <p style="font-size: 0.9rem; opacity: 0.9;">Não disponível</p>
                        </div>
                    `;
                    
                    this.style.display = 'none';
                    slide.appendChild(placeholder);
                });
                
                // Quando a imagem carregar
                img.addEventListener('load', function() {
                    console.log(`Imagem ${index + 1} carregada com sucesso`);
                    ajustarImagemAtual();
                });
            }
        });
        
        // Iniciar auto-play
        startAutoPlay();
        
        // Pausar auto-play ao interagir
        carrossel.addEventListener('mouseenter', stopAutoPlay);
        carrossel.addEventListener('mouseleave', startAutoPlay);
        carrossel.addEventListener('touchstart', stopAutoPlay);
        carrossel.addEventListener('touchend', () => setTimeout(startAutoPlay, 5000));
        
        // Inicializar
        updateCarrossel();
        
        // Ajustar após carregamento completo
        setTimeout(ajustarImagemAtual, 300);
        
        // Ajustar ao redimensionar
        window.addEventListener('resize', ajustarImagemAtual);
    }
    
    // Ajustar todas as imagens após carregamento
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.querySelectorAll('.foto-retrato').forEach(img => {
                if (img.complete) {
                    const parent = img.closest('.carrossel-retrato');
                    if (parent) {
                        const containerHeight = parent.offsetHeight;
                        img.style.maxHeight = `${containerHeight * 0.85}px`;
                    }
                }
            });
        }, 1000);
    });
    
    // Otimizar a imagem de fundo para 1280x852
    const imagemFundo = document.querySelector('.imagem-fundo');
    if (imagemFundo) {
        imagemFundo.addEventListener('load', function() {
            console.log('Imagem de fundo carregada:', this.naturalWidth + 'x' + this.naturalHeight);
            
            // Se a imagem for 1280x852 (paisagem)
            if (this.naturalWidth === 1280 && this.naturalHeight === 852) {
                console.log('Otimizando imagem 1280x852...');
                
                // Para imagens paisagem menores que a tela
                this.style.objectFit = 'contain';
                this.style.backgroundColor = '#f7cac9'; // Cor de fundo para bordas
                
                // Adicionar leve suavização
                this.style.filter = 'contrast(1.05) brightness(1.02)';
            }
        });
        
        // Forçar carregamento prioritário
        imagemFundo.loading = 'eager';
        imagemFundo.fetchPriority = 'high';
    }
});