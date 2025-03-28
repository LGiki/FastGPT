import Markdown from '@/components/Markdown';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
  Textarea
} from '@chakra-ui/react';
import { ChatItemValueTypeEnum } from '@fastgpt/global/core/chat/constants';
import {
  AIChatItemValueItemType,
  ToolModuleResponseItemType,
  UserChatItemValueItemType
} from '@fastgpt/global/core/chat/type';
import React, { useCallback, useEffect } from 'react';
import MyIcon from '@fastgpt/web/components/common/Icon';
import Avatar from '@fastgpt/web/components/common/Avatar';
import {
  InteractiveBasicType,
  UserInputInteractive,
  UserSelectInteractive
} from '@fastgpt/global/core/workflow/template/system/interactive/type';
import { isEqual } from 'lodash';
import FormLabel from '@fastgpt/web/components/common/MyBox/FormLabel';
import QuestionTip from '@fastgpt/web/components/common/MyTooltip/QuestionTip';
import { FlowNodeInputTypeEnum } from '@fastgpt/global/core/workflow/node/constant';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';
import MySelect from '@fastgpt/web/components/common/MySelect';
import MyTextarea from '@/components/common/Textarea/MyTextarea';
import MyNumberInput from '@fastgpt/web/components/common/Input/NumberInput';
import { SendPromptFnType } from '../ChatContainer/ChatBox/type';
import { eventBus, EventNameEnum } from '@/web/common/utils/eventbus';

type props = {
  value: UserChatItemValueItemType | AIChatItemValueItemType;
  isLastResponseValue: boolean;
  isChatting: boolean;
};

const onSendPrompt: SendPromptFnType = (e) => eventBus.emit(EventNameEnum.sendQuestion, e);

const RenderText = React.memo(function RenderText({
  showAnimation,
  text
}: {
  showAnimation: boolean;
  text?: string;
}) {
  let source = text || '';
  // First empty line
  // if (!source && !isLastChild) return null;

  return <Markdown source={source} showAnimation={showAnimation} />;
});
const RenderTool = React.memo(
  function RenderTool({
    showAnimation,
    tools
  }: {
    showAnimation: boolean;
    tools: ToolModuleResponseItemType[];
  }) {
    return (
      <Box>
        {tools.map((tool) => {
          const toolParams = (() => {
            try {
              return JSON.stringify(JSON.parse(tool.params), null, 2);
            } catch (error) {
              return tool.params;
            }
          })();
          const toolResponse = (() => {
            try {
              return JSON.stringify(JSON.parse(tool.response), null, 2);
            } catch (error) {
              return tool.response;
            }
          })();

          return (
            <Accordion key={tool.id} allowToggle _notLast={{ mb: 2 }}>
              <AccordionItem borderTop={'none'} borderBottom={'none'}>
                <AccordionButton
                  w={'auto'}
                  bg={'white'}
                  borderRadius={'md'}
                  borderWidth={'1px'}
                  borderColor={'myGray.200'}
                  boxShadow={'1'}
                  pl={3}
                  pr={2.5}
                  _hover={{
                    bg: 'auto'
                  }}
                >
                  <Avatar src={tool.toolAvatar} w={'1.25rem'} h={'1.25rem'} borderRadius={'sm'} />
                  <Box mx={2} fontSize={'sm'} color={'myGray.900'}>
                    {tool.toolName}
                  </Box>
                  {showAnimation && !tool.response && <MyIcon name={'common/loading'} w={'14px'} />}
                  <AccordionIcon color={'myGray.600'} ml={5} />
                </AccordionButton>
                <AccordionPanel
                  py={0}
                  px={0}
                  mt={3}
                  borderRadius={'md'}
                  overflow={'hidden'}
                  maxH={'500px'}
                  overflowY={'auto'}
                >
                  {toolParams && toolParams !== '{}' && (
                    <Box mb={3}>
                      <Markdown
                        source={`~~~json#Input
${toolParams}`}
                      />
                    </Box>
                  )}
                  {toolResponse && (
                    <Markdown
                      source={`~~~json#Response
${toolResponse}`}
                    />
                  )}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          );
        })}
      </Box>
    );
  },
  (prevProps, nextProps) => isEqual(prevProps, nextProps)
);
const RenderResoningContent = React.memo(function RenderResoningContent({
  content,
  isChatting,
  isLastResponseValue
}: {
  content: string;
  isChatting: boolean;
  isLastResponseValue: boolean;
}) {
  const { t } = useTranslation();
  const showAnimation = isChatting && isLastResponseValue;

  return (
    <Accordion allowToggle defaultIndex={isLastResponseValue ? 0 : undefined}>
      <AccordionItem borderTop={'none'} borderBottom={'none'}>
        <AccordionButton
          w={'auto'}
          bg={'white'}
          borderRadius={'md'}
          borderWidth={'1px'}
          borderColor={'myGray.200'}
          boxShadow={'1'}
          pl={3}
          pr={2.5}
          py={1}
          _hover={{
            bg: 'auto'
          }}
        >
          <HStack mr={2} spacing={1}>
            <MyIcon name={'core/chat/think'} w={'0.85rem'} />
            <Box fontSize={'sm'}>{t('chat:ai_reasoning')}</Box>
          </HStack>

          {showAnimation && <MyIcon name={'common/loading'} w={'0.85rem'} />}
          <AccordionIcon color={'myGray.600'} ml={5} />
        </AccordionButton>
        <AccordionPanel
          py={0}
          pr={0}
          pl={3}
          mt={2}
          borderLeft={'2px solid'}
          borderColor={'myGray.300'}
          color={'myGray.500'}
        >
          <Markdown source={content} showAnimation={showAnimation} />
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
});
const RenderUserSelectInteractive = React.memo(function RenderInteractive({
  interactive
}: {
  interactive: InteractiveBasicType & UserSelectInteractive;
}) {
  return (
    <>
      {interactive?.params?.description && <Markdown source={interactive.params.description} />}
      <Flex flexDirection={'column'} gap={2} w={'250px'}>
        {interactive.params.userSelectOptions?.map((option) => {
          const selected = option.value === interactive?.params?.userSelectedVal;

          return (
            <Button
              key={option.key}
              variant={'whitePrimary'}
              whiteSpace={'pre-wrap'}
              isDisabled={interactive?.params?.userSelectedVal !== undefined}
              {...(selected
                ? {
                    _disabled: {
                      cursor: 'default',
                      borderColor: 'primary.300',
                      bg: 'primary.50 !important',
                      color: 'primary.600'
                    }
                  }
                : {})}
              onClick={() => {
                onSendPrompt({
                  text: option.value,
                  isInteractivePrompt: true
                });
              }}
            >
              {option.value}
            </Button>
          );
        })}
      </Flex>
    </>
  );
});
const RenderUserFormInteractive = React.memo(function RenderFormInput({
  interactive
}: {
  interactive: InteractiveBasicType & UserInputInteractive;
}) {
  const { t } = useTranslation();
  const { register, setValue, handleSubmit: handleSubmitChat, control, reset } = useForm();

  const onSubmit = useCallback((data: any) => {
    onSendPrompt({
      text: JSON.stringify(data),
      isInteractivePrompt: true
    });
  }, []);

  useEffect(() => {
    if (interactive.type === 'userInput') {
      const defaultValues = interactive.params.inputForm?.reduce(
        (acc: Record<string, any>, item) => {
          acc[item.label] = !!item.value ? item.value : item.defaultValue;
          return acc;
        },
        {}
      );
      reset(defaultValues);
    }
  }, []);

  return (
    <Flex flexDirection={'column'} gap={2} w={'250px'}>
      {interactive.params.description && <Markdown source={interactive.params.description} />}
      {interactive.params.inputForm?.map((input) => (
        <Box key={input.label}>
          <FormLabel mb={1} required={input.required} whiteSpace={'pre-wrap'}>
            {input.label}
            {input.description && <QuestionTip ml={1} label={input.description} />}
          </FormLabel>
          {input.type === FlowNodeInputTypeEnum.input && (
            <MyTextarea
              isDisabled={interactive.params.submitted}
              {...register(input.label, {
                required: input.required
              })}
              bg={'white'}
              autoHeight
              minH={40}
              maxH={100}
            />
          )}
          {input.type === FlowNodeInputTypeEnum.textarea && (
            <Textarea
              isDisabled={interactive.params.submitted}
              bg={'white'}
              {...register(input.label, {
                required: input.required
              })}
              rows={5}
              maxLength={input.maxLength || 4000}
            />
          )}
          {input.type === FlowNodeInputTypeEnum.numberInput && (
            <MyNumberInput
              min={input.min}
              max={input.max}
              defaultValue={input.defaultValue}
              isDisabled={interactive.params.submitted}
              bg={'white'}
              register={register}
              name={input.label}
              isRequired={input.required}
            />
          )}
          {input.type === FlowNodeInputTypeEnum.select && (
            <Controller
              key={input.label}
              control={control}
              name={input.label}
              rules={{ required: input.required }}
              render={({ field: { ref, value } }) => {
                if (!input.list) return <></>;
                return (
                  <MySelect
                    ref={ref}
                    width={'100%'}
                    list={input.list}
                    value={value}
                    isDisabled={interactive.params.submitted}
                    onChange={(e) => setValue(input.label, e)}
                  />
                );
              }}
            />
          )}
        </Box>
      ))}
      {!interactive.params.submitted && (
        <Flex w={'full'} justifyContent={'end'}>
          <Button onClick={handleSubmitChat(onSubmit)}>{t('common:Submit')}</Button>
        </Flex>
      )}
    </Flex>
  );
});

const AIResponseBox = ({ value, isLastResponseValue, isChatting }: props) => {
  if (value.type === ChatItemValueTypeEnum.text && value.text)
    return (
      <RenderText showAnimation={isChatting && isLastResponseValue} text={value.text.content} />
    );
  if (value.type === ChatItemValueTypeEnum.reasoning && value.reasoning)
    return (
      <RenderResoningContent
        isChatting={isChatting}
        isLastResponseValue={isLastResponseValue}
        content={value.reasoning.content}
      />
    );
  if (value.type === ChatItemValueTypeEnum.tool && value.tools)
    return <RenderTool showAnimation={isChatting} tools={value.tools} />;
  if (value.type === ChatItemValueTypeEnum.interactive && value.interactive) {
    if (value.interactive.type === 'userSelect')
      return <RenderUserSelectInteractive interactive={value.interactive} />;
    if (value.interactive?.type === 'userInput')
      return <RenderUserFormInteractive interactive={value.interactive} />;
  }
};

export default React.memo(AIResponseBox);
