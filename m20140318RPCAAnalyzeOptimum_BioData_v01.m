% close(f1)
% close(f2) 
% close(f3)

% Optimum for minimum of the norm || T*A - I ||_2
% indexopt = find(normTA == min(normTA))


% Optimum chosen manually
indexopt = 6;


% Plot the optimal



Lopt = Larray(:,:,indexopt)
Sopt = Sarray(:,:,indexopt)
Topt = Tarray(:,:,indexopt);

Avarsopt = Avarsarray(:,:,indexopt);

lambdaopt = lambdas(indexopt)

Mimg = reshape(M,n,tf*q);
Limg = reshape(Lopt,n,tf*q);
Simg = reshape(Sopt,n,tf*q);
invTLimg = reshape(inv(Topt)*Lopt,n,tf*q);
invTSimg = reshape(inv(Topt)*Sopt,n,tf*q);

A_res = -Tarray(n+1:2*n,1:n,indexopt);


f1 = figure();
set(gcf,'color','w');
set(gcf,'units','normalized','outerposition',[0 0 1 1]);
Position2ndMonitor = positionfigure;
set(gcf, 'Position', Position2ndMonitor);
set(gcf,'defaultlinelinewidth',2)
set(gcf,'DefaultTextFontName', 'Arial')
set(gcf,'DefaultTextFontSize', 14)
set(gcf,'defaultaxesfontsize',14)
set(gcf,'defaultaxesfontname','Arial')

% suptitle('Comparison of sparse and low-rank information with Original data')
a0 = subplot(141);
imagesc(Mimg,[min(min(M)) max(max(M))])
title(a0,'M')
b = subplot(143);
imagesc(Simg,[min(min(min(Sopt,Lopt))) max(max(max(Sopt,Lopt)))])
title(b,'S_o_p_t')
d = subplot(142);
imagesc(Limg,[min(min(min(Sopt,Lopt))) max(max(max(Sopt,Lopt)))])
title(d,'L_o_p_t')
f = subplot(144);
imagesc(A_res,[min(min(A_res)) max(max(A_res))])
title(f,'A_m_,_D_T_-_R_P_C_A')



% export_fig(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/CDC2014/Latex/' 'Sc1_AllData'],'-pdf',gcf)




f2 = figure();
set(gcf,'color','w');
set(gcf,'units','normalized','outerposition',[0 0 1 1]);
Position2ndMonitor = positionfigure;
set(gcf, 'Position', Position2ndMonitor);
set(gcf,'defaultlinelinewidth',2)
set(gcf,'DefaultTextFontName', 'Arial')
set(gcf,'DefaultTextFontSize', 14)
set(gcf,'defaultaxesfontsize',14)
set(gcf,'defaultaxesfontname','Arial')

% suptitle('Comparison of sparse and low-rank information with Original data')
a = subplot(131);
imagesc(Mimg,[min(min(min([Mimg invTSimg invTLimg]) )) max(max(max([Mimg invTSimg invTLimg]) ))])
title(a,'M')
b = subplot(133);
imagesc(invTSimg,[min(min(min([Mimg invTSimg invTLimg]) )) max(max(max([Mimg invTSimg invTLimg]) ))])
title(b,'T^-^1*S_o_p_t')
% colorbar
c = subplot(132);
imagesc(invTLimg,[min(min(min([Mimg invTSimg invTLimg]) )) max(max(max([Mimg invTSimg invTLimg]) ))])
title(c,'T^-^1*L_o_p_t')

f3 = figure();
set(gcf,'color','w');
set(gcf,'units','normalized','outerposition',[0 0 1 1]);
% Position2ndMonitor = positionfigure;
% set(gcf, 'Position', Position2ndMonitor);
set(gcf,'defaultlinelinewidth',2)
set(gcf,'DefaultTextFontName', 'Arial')
set(gcf,'DefaultTextFontSize', 14)
set(gcf,'defaultaxesfontsize',14)
set(gcf,'defaultaxesfontname','Arial')

% suptitle('Comparison of sparse and low-rank information with Original data')
imagesc(Topt)
title(a,'M')



%% Save the resulting plot for the optimum

% vers = input('version = ','s')
% 
% saveas(f1,['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' datum '_RPCA_Result_AnalyzeOptimum_LSvsZU_lt' lti_or_v '_n' num2str(n) '_tf' num2str(T) '_q' num2str(q) '_Znoise' num2str(Znoise) '_U' num2str(factorU)  '_v' vers '.fig'], 'fig')
% saveas(f3,['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' datum '_RPCA_Result_AnalyzeOptimum_Am_lt' lti_or_v '_n' num2str(n) '_tf' num2str(T) '_q' num2str(q) '_Znoise' num2str(Znoise) '_U' num2str(factorU)  '_v' vers '.fig'], 'fig')
%  

set(f1, 'Position', [0 0 1 .2])
saveas(f1,['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_imgMLSAm_SKBR3_n' num2str(n) '_v' version], 'fig')
export_fig(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_imgMLSAm_SKBR3_n' num2str(n) '_v' version],'-pdf',f1)

set(f2, 'Position', [0 0 .45 .15])
saveas(f2,['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_imgMinvTLS_SKBR3_n' num2str(n) '_v' version], 'fig')
export_fig(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_imgMinvTLS_SKBR3_n' num2str(n) '_v' version],'-pdf',f2)





