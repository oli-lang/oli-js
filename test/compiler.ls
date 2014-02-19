{
  ast
  oli
  parse
  expect
  inspect
} = require './lib/helper'

describe 'Compiler', (_) ->

  describe 'basic', (_) ->

    it 'should compile "value" as string', ->
      expect parse('value') .to.be.equal 'value'

    it 'should compile "12" as number', ->
      expect parse('12') .to.be.equal 12

    it 'should compile "12.3412" as decimal number', ->
      expect parse('12.3412') .to.be.equal 12.3412

    it 'should compile "-9.1" as signed off number', ->
      expect parse('-9.1') .to.be.equal -9.1

    it 'should compile "0xFFF" as signed off number', ->
      expect parse('0xFFF') .to.be.equal 4095

    it 'should compile "true" as boolean', ->
      expect parse('true') .to.be.true

    it 'should compile "no" as boolean', ->
      expect parse('no') .to.be.false

  describe 'lists', (_) ->

    it 'should compile "- 1, 2, 3" as in-line list', ->
      expect parse('- 1, 2, 3') .to.be.deep.equal [ 1, 2, 3 ]

    it 'should compile "block: - 1, 2, 3" as in-line list', ->
      expect parse('block: - 1, 2, 3').block .to.be.deep.equal [ 1, 2, 3 ]

    it 'should compile "-- [1, 2, 3]" as first level list', ->
      expect parse('-- [ 1, 2, 3 ]') .to.be.deep.equal [ 1, 2, 3 ]

    it 'should compile first level list with in-line blocks', ->
      result = parse '''
      --
      name: oli
      type: language
      site: 'http://oli-lang.org'
      '''
      expect result .to.be.deep.equal [
        * name: 'oli'
        * type: 'language'
        * site: 'http://oli-lang.org'
      ]

    it 'should compile first level list with in-line primitives', ->
      result = parse '''
      --
      oli
      yes
      3.14
      '''
      expect result .to.be.deep.equal [ 'oli', yes, 3.14 ]

  describe 'blocks', (_) ->

    it 'should compile an value assignment', ->
      expect parse 'hello: oli' .to.be.deep.equal hello: 'oli'

    it 'should compile an block with reference expression', ->
      expect parse 'hello > world: oli' .to.be.deep.equal hello: world: 'oli'

    it 'should compile an block with attributes', ->
      expect parse 'hello (attr: yes, another: 12.2): oli' .to.be.deep.equal {
        hello:
          $$body: 'oli'
          $$attributes:
            attr: yes
            another: 12.2
      }

    it 'should compile an block unassigned attributes', ->
      expect parse 'hello (attr, another: nil): oli' .to.be.deep.equal {
        hello:
          $$body: 'oli'
          $$attributes:
            attr: null
            another: null
      }

    it 'should compile an block with reference and attributes', ->
      expect parse 'hello > world (attr: yes): oli' .to.be.deep.equal {
        hello:
          world:
            $$body: 'oli'
            $$attributes: attr: yes
      }

    describe 'empty block', (_) ->

      it 'should compile as unassigned empty block', ->
        expect parse 'hello!:' .to.be.deep.equal hello: null

      it 'should ignore assignment and compile as empty block', ->
        expect parse 'hello!: oli' .to.be.deep.equal hello: null

      it 'should ignore assignment and compile as empty block', ->
        expect parse 'hello!: "oli" end' .to.be.deep.equal hello: null

    describe 'multi-line', (_) ->

      it 'should compile block with nested blocks values', ->
        result = parse '''
        hello:
          world: oli
          rules: yes
        end
        '''
        expect result .to.be.deep.equal {
          hello:
            world: 'oli'
            rules: yes
        }

      it 'should compile block with nested blocks values with attributes', ->
        result = parse '''
        hello (attr):
          world (attr): oli
          rules (attr): yes
        end
        '''
        expect result .to.be.deep.equal {
          hello:
            $$attributes: attr: null
            $$body:
              world:
                $$attributes: attr: null
                $$body: 'oli'
              rules:
                $$attributes: attr: null
                $$body: yes
        }

      it 'should compile block with primitive mixed values', ->
        result = parse '''
        hello:
          oli
          yes
          3.14
          'cool'
        end
        '''
        expect result .to.be.deep.equal hello: [ 'oli', yes, 3.14, 'cool' ]

      it 'should compile block with lists', ->
        result = parse '''
        hello:
          - hello, oli
          [ 3.14, yes ]
        end
        '''
        expect result .to.be.deep.equal hello: [ [ 'hello', 'oli' ], [ 3.14, yes ] ]

      it 'should compile a block with nested blocks', ->
        result = parse '''
        hello:
          world:
            using: oli
          end
          this:
            language: rules
          end
        end
        '''
        expect result .to.be.deep.equal {
          hello:
            world: using: 'oli'
            this: language: 'rules'
        }

      it 'should compile a block with same name blocks identifiers', ->
        result = parse '''
        hello:
          world:
            using: oli
          end
          world:
            language: oli
          end
        end
        '''
        expect result .to.be.deep.equal {
          hello:
            world:
              * using: 'oli'
              * language: 'oli'
        }

    describe 'pipe statement', (_) ->

      it 'should compile nested blocks', ->
        result = parse '''
        hello:
          | world: oli
          | rules: yes
        '''
        expect result .to.be.deep.equal {
          hello:
            world: 'oli'
            rules: yes
        }

      it 'should compile nested mixed types statements', ->
        result = parse '''
        hello:
          | world: oli
          | yes
          | 12.2
          | 'cool'
        '''
        expect result .to.be.deep.equal {
          hello: [
            world: 'oli'
            yes
            12.2
            'cool'
          ]
        }

    describe 'raw blocks', (_) ->

      describe 'unfolded (:=)', (_) ->

      describe 'folded (:-)', (_) ->

      describe 'raw (:>)', (_) ->

        it 'should compile "hello: world" as raw string', ->
          expect parse('raw:> hello: world').raw .to.be.equal 'hello: world'

        it 'should compile multi-line as raw string', ->
          code = '''
            raw:>
              I'm a
              raw string
            end
          '''
          expect parse(code).raw .to.be.equal 'I\'m a\n  raw string'

  describe 'references', ->

    describe 'primitives', (_) ->

      it 'should points to a string reference', ->
        result = parse '''
        &text: hello
        hello: *text
        '''
        expect result.hello .to.be.equal 'hello'

      it 'should replace a number by his reference', ->
        result = parse '''
        &number: 1
        text: *number
        '''
        expect result.text .to.be.equal '1'

      it 'should replace a boolean by his reference', ->
        result = parse '''
        &bool: no
        text: *bool
        '''
        expect result.text .to.be.equal 'false'

      it 'should replace string by his reference', ->
        result = parse '''
        &name: oli
        surname: *name language
        '''
        expect result.surname .to.be.equal 'oli language'

      it 'should replace multiple interpolated string by his references', ->
        code = '''
        &name: oli
        &type: language
        &site: 'http://oli-lang.org'
        full: *name (*type) - *site
        '''
        expect parse(code).full .to.be.equal 'oli (language) - http://oli-lang.org'

      it 'should reference properly using different operators', ->
        code = '''
        &name: oli
        !&type: language
        web > site: 'http://oli-lang.org'
        full: *name (*type) - *site
        '''
        expect parse(code).full .to.be.equal 'oli (language) - http://oli-lang.org'

    describe 'strings', (_) ->

      it 'should reference in inperpolated doble-quoted string', ->
        code = '''
        &name: oli
        &site: 'http://oli-lang.org'
        full: "*name - *site"
        '''
        expect parse(code).full .to.be.equal 'oli - http://oli-lang.org'

      it 'should not process references in single-quoted string', ->
        code = '''
        &name: oli
        &site: 'http://oli-lang.org'
        full: '*name - *site'
        '''
        expect parse(code).full .to.be.equal '*name - *site'

      it 'should reference in mixed string with doble-quotes', ->
        code = '''
        &name: oli
        &site: 'http://oli-lang.org'
        full: *name - "*site"
        '''
        expect parse(code).full .to.be.equal 'oli - "http://oli-lang.org"'

      it 'should reference in mixed string with doble escaped quotes', ->
        code = '''
        &name: oli
        &site: 'http://oli-lang.org'
        full: *name - \"*site\"
        '''
        expect parse(code).full .to.be.equal 'oli - "http://oli-lang.org"'

      it 'should reference a string intepolated in a path-like expression', ->
        code = '''
        &name: oli
        &site: 'http://oli-lang.org'
        full: /home/*name/*site
        '''
        expect parse(code).full .to.be.equal '/home/oli/http://oli-lang.org'

    describe 'hidden', (_) ->

      it 'should use hidden string references', ->
        code = '''
        name = oli
        site = 'http://oli-lang.org'
        full: *name - *site
        '''
        expect parse code .to.be.deep.equal full: 'oli - http://oli-lang.org'

      it 'should extend from a hidden block reference', ->
        code = '''
        name =
          oli: rules
          site: 'http://oli-lang.org'
        end
        result >> name:
          oli: yes
        end
        '''
        expect parse code .to.be.deep.equal { 
          result:
            oli: yes
            site: 'http://oli-lang.org'
        }

      it 'should merge from a hidden block reference', ->
        code = '''
        name =
          oli: rules
          site: 'http://oli-lang.org'
        end
        result >>> name:
          open: yes
        end
        '''
        expect parse code .to.be.deep.equal { 
          result:
            oli: 'rules'
            site: 'http://oli-lang.org'
            open: yes
        }

    describe 'context binding', (_) ->

      it 'should use a string reference from options locals context', ->
        context = name: 'oli'
        code = '''
        result:
          name: *name
        end
        '''
        expect parse code, locals: context .to.be.deep.equal { 
          result: name: 'oli'
        }

      it 'should use a block reference from options locals context', ->
        context =
          name:
            oli: 'rules'
            site: 'http://oli-lang.org'
        code = '''
        result >>> name:
          open: yes
        end
        '''
        expect parse code, locals: context .to.be.deep.equal { 
          result:
            oli: 'rules'
            site: 'http://oli-lang.org'
            open: yes
        }

      it 'should throw an error if the types are mismatched using options locals context', ->
        context = name: 'oli'
        code = '''
        result >> name:
          name: 'oli'
        end
        '''
        expect (-> parse code, locals: context ) .to.throw /is not a bloc/

    describe 'blocks inheritance', (_) ->

      describe 'extend', (_) ->

        it 'should extend from a one-level block', ->
          result = parse '''
          &oli:
            says: hello
          end
          name >> oli:
            name: tom
          end
          '''
          expect result.name .to.be.deep.equal {
            name: 'tom'
            says: 'hello'
          }

        it 'should extend from nested block', ->
          result = parse '''
          &oli:
            says: hello
          end
          name:
            name >> oli:
              featured:
                language: yes
              end
            end
          end
          '''
          expect result.name .to.be.deep.equal {
            name:
              featured:
                language: yes
              says: 'hello'
          }

      describe 'merge', (_) ->

        it 'should merge deeply multiple blocks', ->
          result = parse '''
          &oli:
            says: hello
            featured:
              name: oli
            end
          end
          name:
            name >>> oli:
              featured:
                language: yes
              end
            end
          end
          '''
          expect result.name .to.be.deep.equal {
            name:
              says: 'hello'
              featured:
                language: yes
                name: 'oli'
          }

        it 'should merge deeply multiple blocks with mixed lists', ->
          result = parse '''
          &oli:
            says: hello
            featured:
              name: oli
              - 1, 2, 3
            end
          end
          name:
            name >>> oli:
              featured:
                language: yes
              end
            end
          end
          '''
          expect result.name .to.be.deep.equal {
            name:
              says: 'hello'
              featured:
                '1': [ 1, 2, 3 ]
                name: 'oli'
                language: yes
          }

        it 'should merge deeply multiple list', ->
          result = parse '''
          &oli: [
            one
            block: name
          ]
          name:
            name >>> oli: [
              save: no
              two
              3
            ]
          end
          '''
          expect result.name .to.be.deep.equal {
            name: [
              * save: no
              * block: 'name'
              3
            ]
          }

      describe 'multiple', (_) ->

        it 'should multiple extend from nested block', ->
          result = parse '''
          &oli:
            says: hello
          end
          &rules:
            cool: yes
          end
          name:
            name >> oli >> rules:
              featured:
                language: yes
              end
            end
          end
          '''
          expect result.name .to.be.deep.equal {
            name:
              featured:
                language: yes
              says: 'hello'
              cool: yes
          }

      describe 'type errors', (_) ->

        it 'should throw an exception if string references points to a block', ->
          code = '''
          &oli:
            hello
          end
          name: my name is *oli
          '''
          expect (-> parse code) .to.throw /strings references cannot/

        it 'should throw an exception if string references points to a list', ->
          code = '''
          &oli: - hello
          name: my name is *oli
          '''
          expect (-> parse code) .to.throw /strings references cannot/

        it 'should throw an exception if cannot extend', ->
          code = '''
          &oli: hello
          name >> oli:
            featured: yes
          end
          '''
          expect (-> parse code) .to.throw /not a block/

        it 'should throw an exception if types are mismatched', ->
          code = '''
          &oli: [ hello ]
          name >> oli:
            featured: yes
          end
          '''
          expect (-> parse code) .to.throw /mismatched/

  describe 'options', (_) ->

    describe 'meta', (_) ->

      it 'should parse and return an intermediate compilation result with meta data', ->
        code = '''
        oli:
          hello
        end
        '''
        expect parse code, meta: yes .to.be.deep.equal {
          oli:
            '$$name': 'oli'
            '$$operator': ':'
            '$$body': [ 'hello' ]
          }

      it 'should parse and return an intermediate compilation result with meta data', ->
        code = '''
        oli: [
          world:
            using: oli
          end
        ]
        '''
        expect parse code, meta: yes .to.be.deep.equal {
          oli:
            '$$name': 'oli'
            '$$operator': ':'
            '$$body':
              'world':
                '$$name': 'world'
                '$$operator': ':'
                '$$body':
                  'using':
                    '$$name': 'using'
                    '$$operator': ':'
                    '$$body': 'oli'
          }
