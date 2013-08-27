-module(jsbuf_codegen).

-export([
         generate_field/5,
         generate_enum/3,
         generate_message/4
        ]).

generate_field(Rule, Name, Num, Opts, Type) ->
    ok.

generate_enum(Name, [{FieldAtom, Value}], Acc) ->
    ok.

generate_message(Fields, Enums, Messages, Proto) ->
    ok.
