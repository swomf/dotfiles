#!/usr/bin/perl

use strict;
use warnings;
use File::Copy;
use Cwd qw(abs_path);
use File::Path qw(make_path);

my $script_dir = abs_path($0);
$script_dir =~ s/\/[^\/]+$//;

sub arrow_msg {
  my $msg = shift;
  print "\e[32m\e[1m=> \e[0m\e[1m$msg\e[0m\n";
}

my %dot_locations = (
  ".config" => [
    "ags",
    "hypr",
    "foot"
  ]
);

foreach my $dot_dir (keys %dot_locations) {
  foreach my $dot (@{$dot_locations{$dot_dir}}) {
    my $dotless_dir = ($dot_dir =~ /^\./ ? substr($dot_dir, 1) : $dot_dir);
    make_path("$script_dir/$dotless_dir") unless (-d "$script_dir/$dotless_dir");
    arrow_msg "Syncing $dot_dir/$dot -> $script_dir/config";
    system("
      rsync \\
      --archive \\
      --verbose \\
      --human-readable \\
      --progress \\
      --delete \\
      --exclude=\".git*\" \\
      \"$ENV{HOME}/$dot_dir/$dot\" \"$script_dir/$dotless_dir\"");
  }
}