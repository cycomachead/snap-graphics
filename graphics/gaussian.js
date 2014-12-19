get_gaussian_kernel = function(size, sigma) {
                var i=0, x=0.0, t=0.0, sigma_x=0.0, scale_2x=0.0;
                var sum = 0.0;
                var _kernel = new Array(size);
                var kernel = new Array(size);

                if((size&1) == 1 && size <= 7 && sigma <= 0) {
                    switch(size>>1) {
                        case 0:
                        _kernel[0] = 1.0;
                        sum = 1.0;
                        break;
                        case 1:
                        _kernel[0] = 0.25, _kernel[1] = 0.5, _kernel[2] = 0.25;
                        sum = 0.25+0.5+0.25;
                        break;
                        case 2:
                        _kernel[0] = 0.0625, _kernel[1] = 0.25, _kernel[2] = 0.375, 
                        _kernel[3] = 0.25, _kernel[4] = 0.0625;
                        sum = 0.0625+0.25+0.375+0.25+0.0625;
                        break;
                        case 3:
                        _kernel[0] = 0.03125, _kernel[1] = 0.109375, _kernel[2] = 0.21875, 
                        _kernel[3] = 0.28125, _kernel[4] = 0.21875, _kernel[5] = 0.109375, _kernel[6] = 0.03125;
                        sum = 0.03125+0.109375+0.21875+0.28125+0.21875+0.109375+0.03125;
                        break;
                    }
                } else {
                    sigma_x = sigma > 0 ? sigma : ((size-1)*0.5 - 1.0)*0.3 + 0.8;
                    scale_2x = -0.5/(sigma_x*sigma_x);

                    for( ; i < size; ++i )
                    {
                        x = i - (size-1)*0.5;
                        t = Math.exp(scale_2x*x*x);

                        _kernel[i] = t;
                        sum += t;
                    }
                }

                    // classic kernel
                    sum = 1.0/sum;
                    for (i = 0; i < size; ++i) {
                        kernel[i] = _kernel[i] * sum;
                    }
                    
                return kernel;
            }