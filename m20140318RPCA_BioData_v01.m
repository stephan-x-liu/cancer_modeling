clear all
close all
clc

datum = datestr(now,'yyyymmdd');

%% Settings for comparison to other methods

% Compare to Random projection method (1 is on)
RP = 0;

% Compare to Standard RPCA method (1 is on)
STD = 1;

%% Run the optimization for different lambdas

fname = fullfile('/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Data/SKBR3/20140319_RPCABioData_SKBR3_CDC_Norm_max_Bias_init.mat')

load(fname)

n = n_cps;
lti_or_v = 'v';


lambda = 1/(sqrt(max(n*tf ,q)));
lambdas = [.9:.02:1.1]';
 
ind1 = size(lambdas,1);
ind2 = 1;


% create matrix of 0's with dimensions row/column/depth
rankL = zeros(ind1,ind2);
normnucL = zeros(ind1,ind2);
norm2S = zeros(ind1,ind2);
norm1S = zeros(ind1,ind2);
Larray = zeros(n*tf ,q,ind1,ind2);
Sarray = zeros(n*tf ,q,ind1,ind2);
Tarray = zeros(n*tf ,n*tf ,ind1,ind2);
Avarsarray = zeros(n, n*(tf-1) ,ind1,ind2);
rankL_RP = zeros(ind1,ind2);
normnucL_RP = zeros(ind1,ind2);
norm2S_RP = zeros(ind1,ind2);
norm1S_RP = zeros(ind1,ind2);
Larray_RP = zeros(n*tf ,q,ind1,ind2);
Sarray_RP = zeros(n*tf ,q,ind1,ind2);
Tarray_RP = zeros(n*tf ,n*tf ,ind1,ind2);
rankL_STD = zeros(ind1,ind2);
normnucL_STD = zeros(ind1,ind2);
norm2S_STD = zeros(ind1,ind2);
norm1S_STD = zeros(ind1,ind2);
Larray_STD = zeros(n*tf ,q,ind1,ind2);
Sarray_STD = zeros(n*tf ,q,ind1,ind2);
Tarray_STD = zeros(n*tf ,n*tf ,ind1,ind2);




for j = 1:ind2

    for i = 1:ind1

        [Tarray(1:n*tf ,1:n*tf ,i,j),Larray(1:n*tf ,1:q,i,j),Sarray(1:n*tf ,1:q,i,j), Avarsarray(1:n, 1:n*(tf-1), i,j)] = TRPCA(M,n,tf,q,lambdas(i),lti_or_v);

        rankL(i,j) = rank(Larray(1:n*tf ,1:q,i,j)); % rank matrices
        normnucL(i,j) = norm_nuc(Larray(1:n*tf ,1:q,i,j)); 
        norm2S(i,j) = norm(Sarray(1:n*tf ,1:q,i,j),2);
        norm1S(i,j) = norm(Sarray(1:n*tf ,1:q,i,j),1);
        cost(i,j) = normnucL(i,j) + lambdas(i)*norm1S(i,j);

    end

        % Random Projection-based RPCA 

    if RP == 1


        for i = 1:ind1

            cvx_begin

                variables Psi(n,n) L(n*tf ,q) S(n*tf ,q)

                minimize(  norm_nuc(L) + lambdas(i)*norm(S,1)  )

                subject to

                kron(Psi,eye(tf))*M == L + S

            cvx_end

            Tarray_RP(1:n*tf ,1:n*tf ,i,j) = kron(Psi,eye(tf));

            Larray_RP(1:n*tf ,1:q,i,j) = L;
            Sarray_RP(1:n*tf ,1:q,i,j) = S;
            rankL_RP(i,j) = rank(L);
            normnucL_RP(i,j) = norm_nuc(L);
            norm2S_RP(i,j) = norm(S,2);
            norm1S_RP(i,j) = norm(S,1);

        end

    end

    % Standard RPCA

    if STD == 1

        for i = 1:ind1

            cvx_begin

                variables L(n*tf ,q) S(n*tf ,q)

                minimize(  norm_nuc(L) + lambdas(i)*norm(S,1)  )

                subject to

                M == L + S

            cvx_end


            Larray_STD(1:n*tf ,1:q,i,j) = L;
            Sarray_STD(1:n*tf ,1:q,i,j) = S;
            rankL_STD(i,j) = rank(L);
            normnucL_STD(i,j) = norm_nuc(L);
            norm2S_STD(i,j) = norm(S,2);
            norm1S_STD(i,j) = norm(S,1);

        end

    end

end

%% Plot 1: Rank/nuclear norm of L and 2-norm of S

if ind2 == 1
    
   figure(1)
   set(gcf,'color','w');
%     set(gcf,'units','normalized','outerposition',[0 0 1 1]);
%     Position2ndMonitor = positionfigure;
%     set(gcf, 'Position', Position2ndMonitor);
    set(gcf,'defaultlinelinewidth',2)
    set(gcf,'DefaultTextFontName', 'Arial')
    set(gcf,'DefaultTextFontSize', 14)
    set(gcf,'defaultaxesfontsize',14)
    set(gcf,'defaultaxesfontname','Arial')
    
%     subplot(414)
    [AX,H1,H2] = plotyy(lambdas,normnucL,lambdas,norm1S);
    %set(AX,'XScale','log');
%     set(H1(1),'Linestyle','--')
    set(H2(1),'Linestyle','--')

%     title('Compare norms results vs. norms synthetic data')
%     legend('||L||_*','||Z||_*','||S||_1','||U||_1')
    legend('||L||_*','||S||_1')

    xlabel('\lambda')
    %set(AX,'xlim',[min(lambdas) max(lambdas)])
    xlim(AX(1),[min(lambdas) max(lambdas)])
    xlim(AX(2),[min(lambdas) max(lambdas)])
    set(AX(2),'xtick',get(AX(1),'xtick'),'xticklab',get(AX(1),'xticklab'))
%     set(get(AX(1),'Ylabel'),'String','||L||_* vs ||Z||_*') 
    set(get(AX(1),'Ylabel'),'String','||L||_*') 
    set(get(AX(2),'Ylabel'),'String','||S||_1') 
    set(AX(2),'XTick',[]);

end

%% Plots 2: Compare Transformation-based method with Random Projection method and Standard RPCA 

if ind2 == 1

    % close all
    
    % Plot T^(-1)*S vs A*U and T^(-1)*L vs A*Z
  
    norminvTS = zeros(size(lambdas));
    norminvTS_RP = zeros(size(lambdas));
    normS_STD = zeros(size(lambdas));
    norminvTL = zeros(size(lambdas));
    norminvTL_RP = zeros(size(lambdas));
    normL_STD = zeros(size(lambdas));

    for i = 1:ind1
        norminvTS(i) = norm(inv(Tarray(:,:,i))*Sarray(:,:,i));
        norminvTL(i) = norm(inv(Tarray(:,:,i))*Larray(:,:,i));
     
        norminvTS_RP(i) = norm(inv(Tarray_RP(:,:,i))*Sarray_RP(:,:,i));
        norminvTL_RP(i) = norm(inv(Tarray_RP(:,:,i))*Larray_RP(:,:,i));

        normS_STD(i) = norm(Sarray_STD(:,:,i));
        normL_STD(i) = norm(Larray_STD(:,:,i));
    end

    norminvTL_stack = [norminvTL norminvTL_RP normL_STD];
    norminvTS_stack = [norminvTS norminvTS_RP normS_STD];

    figure(3)
    set(gcf,'color','w');
    set(gcf,'units','normalized','outerposition',[0 0 1 1]);
%     Position2ndMonitor = positionfigure;
%     set(gcf, 'Position', Position2ndMonitor);
    set(gcf,'defaultlinelinewidth',2)
    set(gcf,'DefaultTextFontName', 'Arial')
    set(gcf,'DefaultTextFontSize', 14)
    set(gcf,'defaultaxesfontsize',14)
    set(gcf,'defaultaxesfontname','Arial')

    subplot(211)
    h3 = plot(lambdas,norminvTL_stack);
    if RP == 0 && STD ==1
        delete(h3(2))
        legend('DT-RPCA','RPCA')
    elseif RP == 0 && STD == 0
        delete(h3(2))
        delete(h3(3))
        legend('DT-RPCA')
    elseif RP == 1 && STD == 0
        delete(h3(3))
        legend('DT-RPCA','RP-RPCA')
    else
        legend('DT-RPCA','RP-RPCA','RPCA')
        set(h3(3),'Color','r','LineStyle',':')
    end

    %set(AX,'XScale','log');
    xlabel('\lambda')
    ylabel('||T^-^1 L||_2') 
    title('2-norm of low-rank trajectories')
    xlim([min(lambdas) max(lambdas)])

    subplot(212)
    h3b = plot(lambdas,norminvTS_stack);
    if RP == 0 && STD ==1
        delete(h3b(2))
        legend('DT-RPCA','RPCA')
    elseif RP == 0 && STD == 0
        delete(h3b(2))
        delete(h3b(3))
        legend('DT-RPCA')
    elseif RP == 1 && STD == 0
        delete(h3b(3))
        legend('DT-RPCA','RP-RPCA')
    else
        legend('DT-RPCA','RP-RPCA','RPCA')
        set(h3b(3),'Color','r','LineStyle',':')
    end
    xlabel('\lambda')
    ylabel('||T^-^1 S||_2') 
    %set(AX,'xlim',[min(lambdas) max(lambdas)])
    title('2-norm of sparse trajectories')
    xlim([min(lambdas) max(lambdas)])
    
    % Plot rank of L vs U and 2-norm of S vs Z
    normnucL_stack = [normnucL normnucL_RP normnucL_STD];


    norm1S_stack = [norm1S norm1S_RP norm1S_STD];

    figure(5)
    set(gcf,'color','w');
    set(gcf,'units','normalized','outerposition',[0 0 1 1]);
%     Position2ndMonitor = positionfigure;
%     set(gcf, 'Position', Position2ndMonitor);
    set(gcf,'defaultlinelinewidth',2)
    set(gcf,'DefaultTextFontName', 'Arial')
    set(gcf,'DefaultTextFontSize', 14)
    set(gcf,'defaultaxesfontsize',14)
    set(gcf,'defaultaxesfontname','Arial')

    subplot(211)
    h5 = plot(lambdas,normnucL_stack);
    set(h5(3),'Color','r','LineStyle',':')
    if RP == 0 && STD ==1
        delete(h5(2))
        legend('DT-RPCA','RPCA')
    elseif RP == 0 && STD == 0
        delete(h5(2))
        delete(h5(3))
        legend('DT-RPCA','Original')
    elseif RP == 1 && STD == 0
        delete(h5(3))
        legend('DT-RPCA','RP-RPCA')
    else
        legend('DT-RPCA','RP-RPCA','RPCA')
    end

    %set(AX,'XScale','log');
    xlabel('\lambda')
    ylabel('||L||_*') 
    xlim([min(lambdas) max(lambdas)])
    

    subplot(212)
    h5b = plot(lambdas,norm1S_stack);
    set(h5b(3),'Color','r','LineStyle',':')
    if RP == 0 && STD ==1
        delete(h5b(2))
        legend('DT-RPCA','RPCA')
    elseif RP == 0 && STD == 0
        delete(h5b(2))
        delete(h5b(3))
        legend('DT-RPCA')
    elseif RP == 1 && STD == 0
        delete(h5b(3))
        legend('DT-RPCA','RP-RPCA')
    else
        legend('DT-RPCA','RP-RPCA','RPCA')
    end

    %set(AX,'XScale','log');
    xlabel('\lambda')
    ylabel('||S||_1') 
    %set(AX,'xlim',[min(lambdas) max(lambdas)])
    xlim([min(lambdas) max(lambdas)])
    ylim([0 10])
end


%% Analysis of the resulting model


if lti_or_v == 'i'

    
    for j = 2:size(lambdas,1)
        Ap = Avarsarray(:,1:n,j-1);
        An = Avarsarray(:,1:n,j);
        Adiff = Ap - An;
        AdiffFro(j,1) = sum(Adiff(:).^2);
    end

    figure(6)
    set(gcf,'color','w');
    set(gcf,'units','normalized','outerposition',[0 0 1 1]);
%     Position2ndMonitor = positionfigure;
%     set(gcf, 'Position', Position2ndMonitor);
    set(gcf,'defaultlinelinewidth',2)
    set(gcf,'DefaultTextFontName', 'Arial')
    set(gcf,'DefaultTextFontSize', 14)
    set(gcf,'defaultaxesfontsize',14)
    set(gcf,'defaultaxesfontname','Arial')
    
    plot(lambdas(1:end),AdiffFro)
end

if lti_or_v == 'v'

    
    for j = 2:size(lambdas,1)
        Ap = Avarsarray(:,:,j-1);
        An = Avarsarray(:,:,j);
        Adiff = Ap - An;
        AdiffFro(j,1) = sum(Adiff(:).^2);
    end

    figure(6)
    set(gcf,'color','w');
    set(gcf,'units','normalized','outerposition',[0 0 1 1]);
%     Position2ndMonitor = positionfigure;
%     set(gcf, 'Position', Position2ndMonitor);
    set(gcf,'defaultlinelinewidth',2)
    set(gcf,'DefaultTextFontName', 'Arial')
    set(gcf,'DefaultTextFontSize', 14)
    set(gcf,'defaultaxesfontsize',14)
    set(gcf,'defaultaxesfontname','Arial')
    
    plot(lambdas(1:end),AdiffFro)
    
    title('Frobenius norm between models for adjacent \lambda''s')
%     ylim([0 10])
    
end
%% Save results

version = input('Version (use 01, 02, ...) = ','s')

normmeth = 'Norm_max_Bias_Init';


if lti_or_v == 'i'
    
    foldername = ['BioData_SKBR3_LTV_' normmeth];
    mkdir(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/',foldername]);
    
elseif lti_or_v == 'v' 
    
    foldername = ['BioData_SKBR3_LTV_' normmeth];
    mkdir(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/',foldername]);
    
end

save(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_WS_SKBR3_' normmeth '_n' num2str(n) '_v' version '.mat'])


figure(1)
set(1, 'Position', [0 0 700 200])
saveas(1,['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_LandS_SKBR3_' normmeth '_n' num2str(n) '_v' version], 'fig')
export_fig(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_LandS_SKBR3_' normmeth '_n' num2str(n) '_v' version],'-pdf',1)


figure(5)
subplot(211)
ylim([0 22])
set(5, 'Position', [0 0 .45 .28])
saveas(5,['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_LandS_SKBR3_' normmeth '_n' num2str(n) '_v' version], 'fig')
export_fig(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_LandS_SKBR3_' normmeth '_n' num2str(n) '_v' version],'-pdf',5)

set(6, 'Position', [0 0 .45 .14])
saveas(6,['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_Adiff_SKBR3_' normmeth '_n' num2str(n) '_v' version], 'fig')
export_fig(['/Users/dobbe/Documents/PhD/Research/Breast Cancer - Grand Challenge/Matlab/Results/' foldername '/'  datum '_RPCA_Result_Adiff_SKBR3_' normmeth '_n' num2str(n) '_v' version],'-pdf',6)

