#ifndef _DEBUG_FOR_RELEASE_H_
#define _DEBUG_FOR_RELEASE_H_

#include <iostream>
#include <sstream>
#include <fstream>
#include <map>

using std::cin;
using std::cout;
using std::endl;
using std::string;
using std::stringstream;

//===== DEFINITIONS =====
#define INPUT_DEBUG     "../js/debug.js"
#define INPUT_RELEASE   "../js/release.js"
#define OUTPUT_RELEASE  "data/output/release.js"

//===== VARIABLES =====
// search string
const std::map<string, string> searchStr{
    {"scripts", " scripts: ["},
    {"dep", " scriptDep: ["},
    {"refScripts", " refScriptsUrl: ["},
    {"refCss", " refCssUrl: ["}
};
const std::map<string, string> searchStrEnd{
    {"scripts", " ]"},
    {"dep", " ]"},
    {"refScripts", " ]"},
    {"refCss", " ]"}
};

#endif
