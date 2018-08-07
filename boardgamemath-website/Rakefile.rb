require 'rubygems'

task :default => :build

desc "Setup or update the environment to run Awestruct"
task :setup do
  system "bundle update"
end

desc "Clean out generated site and temporary files"
task :clean do
  require 'fileutils'
  system("echo Cleaning...")
  ['.awestruct', '.sass-cache', '_site', '_tmp'].each do |dir|
    FileUtils.remove_dir dir unless !File.directory? dir
  end
end

desc "Build the site"
task :build => :check do
  system("echo Building...")
  system "bundle exec awestruct -P production --force"
end

desc "Build the site and publish"
task :publish => [:check, :clean, :build] do
  system("echo Publishing...")
  system("cd ../local/")
  system("rm -Rf publishTmp")
  system("mkdir publishTmp")
  system("cd publishTmp")
  system("cp -r ../../.git .")
  system("git checkout gh-pages")
  system("cp -Rf ../../boardgamemath-website/_site/* .")
  system("git add .")
  system("git commit -m\"Automatic publish\"")
  system("git push origin gh-pages")
  system("cd ../../boardgamemath-website")
end

desc "Travis continuous integration task"
task :travis => [:clean, :build] do
end

task :check do
  begin
    require 'bundler'
    Bundler.setup
  rescue StandardError => e
    puts "\e[31m#{e.message}\e[0m"
    puts "\e[33mRun `rake setup` to install required gems.\e[0m"
    exit e.status_code
  end
  Dir.mkdir('_tmp') unless Dir.exist?('_tmp')
end
