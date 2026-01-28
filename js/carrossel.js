document.addEventListener('DOMContentLoaded', function () {
    console.log('Inicializando carrosséis flutuantes...');


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


        if (totalSlides <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (carrossel.querySelector('.carrossel-dots')) {
                carrossel.querySelector('.carrossel-dots').style.display = 'none';
            }
            return;
        }


        track.style.width = `${totalSlides * 100}%`;


        function updateCarrossel() {

            const translateX = -(currentIndex * 100);
            track.style.transform = `translateX(${translateX}%)`;


            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });


            ajustarImagemAtual();
        }


        function ajustarImagemAtual() {
            const slideAtual = slides[currentIndex];
            const img = slideAtual.querySelector('img');

            if (img) {

                img.style.maxHeight = '';
                img.style.maxWidth = '';


                img.classList.add('foto-retrato');


                if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                    const imgRatio = img.naturalWidth / img.naturalHeight;


                    if (imgRatio > 1.3) {

                        img.style.maxWidth = '85%';
                        img.style.maxHeight = 'auto';
                    } else {

                        img.style.maxWidth = 'auto';
                        img.style.maxHeight = '85%';
                    }
                }
            }
        }


        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            currentIndex = index;
            updateCarrossel();
        }


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


        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(currentIndex - 1);
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
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


        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
                stopAutoPlay();
                setTimeout(startAutoPlay, 10000);
            });
        });


        slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                img.addEventListener('error', function () {
                    console.warn(`Erro ao carregar imagem ${index + 1}:`, this.src);
                    this.alt = 'Imagem não disponível';


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


                img.addEventListener('load', function () {
                    console.log(`Imagem ${index + 1} carregada com sucesso`);
                    ajustarImagemAtual();
                });
            }
        });


        startAutoPlay();


        carrossel.addEventListener('mouseenter', stopAutoPlay);
        carrossel.addEventListener('mouseleave', startAutoPlay);
        carrossel.addEventListener('touchstart', stopAutoPlay);
        carrossel.addEventListener('touchend', () => setTimeout(startAutoPlay, 5000));


        updateCarrossel();


        setTimeout(ajustarImagemAtual, 300);


        window.addEventListener('resize', ajustarImagemAtual);
    }


    window.addEventListener('load', function () {
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


    const imagemFundo = document.querySelector('.imagem-fundo');
    if (imagemFundo) {
        imagemFundo.addEventListener('load', function () {
            console.log('Imagem de fundo carregada:', this.naturalWidth + 'x' + this.naturalHeight);


            if (this.naturalWidth === 1280 && this.naturalHeight === 852) {
                console.log('Otimizando imagem 1280x852...');


                this.style.objectFit = 'contain';
                this.style.backgroundColor = '#f7cac9';


                this.style.filter = 'contrast(1.05) brightness(1.02)';
            }
        });


        imagemFundo.loading = 'eager';
        imagemFundo.fetchPriority = 'high';
    }
});