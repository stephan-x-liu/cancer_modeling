

num_lam = length(lambdas)

for i = 1:num_lam
    Lsave((i-1)*n*tf+1:i*n*tf,:) = Larray(:,:,i);
    Ssave((i-1)*n*tf+1:i*n*tf,:) = Sarray(:,:,i);
    Tsave((i-1)*n*tf+1:i*n*tf,:) = Tarray(:,:,i);
end

xlswrite(['/Users/dobbe/Dropbox/Systems Biology/Matlab/Biological/Joe Gray 480/Results/Output Stephan/' datum '_RPCA_' dataset '_' normmeth '_' treatment '_M'],M)
xlswrite(['/Users/dobbe/Dropbox/Systems Biology/Matlab/Biological/Joe Gray 480/Results/Output Stephan/' datum '_RPCA_' dataset '_' normmeth '_' treatment '_Larray'],Lsave)
xlswrite(['/Users/dobbe/Dropbox/Systems Biology/Matlab/Biological/Joe Gray 480/Results/Output Stephan/' datum '_RPCA_' dataset '_' normmeth '_' treatment '_Sarray'],Ssave)
xlswrite(['/Users/dobbe/Dropbox/Systems Biology/Matlab/Biological/Joe Gray 480/Results/Output Stephan/' datum '_RPCA_' dataset '_' normmeth '_' treatment '_Tarray'],Tsave)
xlswrite(['/Users/dobbe/Dropbox/Systems Biology/Matlab/Biological/Joe Gray 480/Results/Output Stephan/' datum '_RPCA_' dataset '_' normmeth '_' treatment '_lambdavalues'],lambdas)



