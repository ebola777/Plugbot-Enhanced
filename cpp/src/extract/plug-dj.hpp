/* Extract Plug.DJ emoticons
 */
#ifndef _EXTRACT_PLUGDJ_H_
#define _EXTRACT_PLUGDJ_H_

#include <iostream>
#include <cstdio>
#include <fstream>
#include <map>
#include <tuple>
#include <boost/regex.hpp>
#include "../extension/flow-control.hpp"
#include "../extension/formatter.hpp"

using std::cin;
using std::cout;
using std::cerr;
using std::endl;
using std::string;

//===== PROTOTYPES =====
int stoi(const string &);

//===== CONSTANTS =====
#define INPUT_CSS       "data/input/room.css"
#define INPUT_JS        "data/input/room.js"
#define OUTPUT_RESULT   "data/output/emoticons.txt"
#define CSS_W       17
#define CSS_H       17
#define CSS_W_END   136
#define CSS_H_END   2006
#define MAX_WIDTH   78

//===== VARIABLES =====
// css
const boost::regex regexCss("span.emoji-"
                            "(?<css>(\\w+)(-\\w+)*)"
                            "\\{background-position:"
                            "(?<pos-x>-?\\d+)(px)?"
                            "\\s"
                            "(?<pos-y>-?\\d+)(px)?"
                            "\\}");
const boost::regex regexCssCheck("span.emoji-.+\\{.+\\}");
// smiley map
const boost::regex regexSmileyMap("(?<dq>\"?)(?<key>[^,\"]+)\\g{dq}:"
                                    "\"(?<item>[^\"]+)\"");
// css map
const boost::regex regexCssMap(regexSmileyMap);

#endif
