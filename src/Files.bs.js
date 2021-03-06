// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE
'use strict';

var List = require("bs-platform/lib/js/list.js");
var Unix = require("bs-platform/lib/js/unix.js");
var Curry = require("bs-platform/lib/js/curry.js");
var $$String = require("bs-platform/lib/js/string.js");
var Filename = require("bs-platform/lib/js/filename.js");
var Caml_bytes = require("bs-platform/lib/js/caml_bytes.js");
var Pervasives = require("bs-platform/lib/js/pervasives.js");
var Caml_js_exceptions = require("bs-platform/lib/js/caml_js_exceptions.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");

function maybeStat(path) {
  try {
    return Unix.stat(path);
  }
  catch (raw_exn){
    var exn = Caml_js_exceptions.internalToOCamlException(raw_exn);
    if (exn[0] === Unix.Unix_error) {
      var match = exn[1];
      if (typeof match === "number") {
        if (match !== 20) {
          throw exn;
        }
        return ;
      }
      throw exn;
    }
    throw exn;
  }
}

function readFile(path) {
  var match = maybeStat(path);
  if (match === undefined) {
    return ;
  }
  if (match.st_kind !== 0) {
    return ;
  }
  var ic = Pervasives.open_in(path);
  var try_read = function (param) {
    var x;
    try {
      x = Pervasives.input_line(ic);
    }
    catch (exn){
      if (exn === Caml_builtin_exceptions.end_of_file) {
        return ;
      }
      throw exn;
    }
    return x;
  };
  var loop = function (_acc) {
    while(true) {
      var acc = _acc;
      var s = try_read(undefined);
      if (s !== undefined) {
        _acc = /* :: */[
          s,
          acc
        ];
        continue ;
      }
      Pervasives.close_in(ic);
      return List.rev(acc);
    };
  };
  return $$String.concat($$String.make(1, /* "\n" */10), loop(/* [] */0));
}

function writeFile(path, contents) {
  try {
    var out = Pervasives.open_out(path);
    Pervasives.output_string(out, contents);
    Pervasives.close_out(out);
    return true;
  }
  catch (exn){
    return false;
  }
}

function copy(source, dest) {
  var match = maybeStat(source);
  if (match === undefined) {
    return false;
  }
  var st_perm = match.st_perm;
  var fs = Unix.openfile(source, /* :: */[
        /* O_RDONLY */0,
        /* [] */0
      ], st_perm);
  var fd = Unix.openfile(dest, /* :: */[
        /* O_WRONLY */1,
        /* :: */[
          /* O_CREAT */5,
          /* :: */[
            /* O_TRUNC */6,
            /* [] */0
          ]
        ]
      ], st_perm);
  var buffer = Caml_bytes.caml_create_bytes(8192);
  var copy_loop = function (_param) {
    while(true) {
      var r = Unix.read(fs, buffer, 0, 8192);
      if (r === 0) {
        return ;
      }
      Unix.write(fd, buffer, 0, r);
      _param = undefined;
      continue ;
    };
  };
  copy_loop(undefined);
  Unix.close(fs);
  Unix.close(fd);
  return true;
}

function exists(path) {
  return maybeStat(path) !== undefined;
}

function isFile(path) {
  var match = maybeStat(path);
  if (match !== undefined) {
    return match.st_kind === 0;
  } else {
    return false;
  }
}

function isDirectory(path) {
  var match = maybeStat(path);
  if (match !== undefined) {
    return match.st_kind === 1;
  } else {
    return false;
  }
}

function readDirectory(dir) {
  var maybeGet = function (handle) {
    try {
      return Unix.readdir(handle);
    }
    catch (exn){
      if (exn === Caml_builtin_exceptions.end_of_file) {
        return ;
      }
      throw exn;
    }
  };
  var loop = function (handle) {
    while(true) {
      var name = maybeGet(handle);
      if (name !== undefined) {
        if (!(name === Filename.current_dir_name || name === Filename.parent_dir_name)) {
          return /* :: */[
                  name,
                  loop(handle)
                ];
        }
        continue ;
      }
      Unix.closedir(handle);
      return /* [] */0;
    };
  };
  return loop(Unix.opendir(dir));
}

function mkdirp(dest) {
  if (exists(dest)) {
    return ;
  }
  var parent = Curry._1(Filename.dirname, dest);
  mkdirp(parent);
  return Unix.mkdir(dest, 480);
}

function copyDeep(source, dest) {
  mkdirp(Curry._1(Filename.dirname, dest));
  var match = maybeStat(source);
  if (match === undefined) {
    return ;
  }
  var match$1 = match.st_kind;
  if (match$1 !== 1) {
    if (match$1 !== 0) {
      return ;
    } else {
      copy(source, dest);
      return ;
    }
  } else {
    return List.iter((function (name) {
                  return copyDeep(Filename.concat(source, name), Filename.concat(dest, name));
                }), readDirectory(source));
  }
}

function removeDeep(path) {
  var match = maybeStat(path);
  if (match !== undefined) {
    if (match.st_kind !== 1) {
      return Unix.unlink(path);
    } else {
      List.iter((function (name) {
              return removeDeep(Filename.concat(path, name));
            }), readDirectory(path));
      return Unix.rmdir(path);
    }
  }
  
}

exports.exists = exists;
exports.isFile = isFile;
exports.isDirectory = isDirectory;
exports.mkdirp = mkdirp;
exports.readDirectory = readDirectory;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.removeDeep = removeDeep;
exports.copy = copy;
exports.copyDeep = copyDeep;
/* Unix Not a pure module */
