/*
 * Copyright (c) 2020-present unTill Pro, Ltd.
 */

import StateMachineMessage from '../StateMachineMessage';

export class MessageInit extends StateMachineMessage {
    getName() {
        return 'MessageInit';
    }
}

export class MessageNotify extends StateMachineMessage {
    getName() {
        return 'MessageNotify';
    }
}

export class MessageDrop extends StateMachineMessage {
    getName() {
        return 'MessageDrop';
    }
}

export class MessageOk extends StateMachineMessage {
    getName() {
        return 'MessageOk';
    }
}

export class MessageCancel extends StateMachineMessage {
    getName() {
        return 'MessageCancel';
    }
}

export class MessageProceed extends StateMachineMessage {
    getName() {
        return 'MessageProceed';
    }
}

export class MessageValidate extends StateMachineMessage {
    getName() {
        return 'MessageValidate';
    }
}

export class MessageSelectView extends StateMachineMessage {
    getName() {
        return 'MessageSelectView';
    }
}

export class MessageSelectEntity extends StateMachineMessage {
    getName() {
        return 'MessageSelectEntity';
    }
}

export class MessageNeedEdit extends StateMachineMessage {
    getName() {
        return 'MessageNeedEdit';
    }
}

export class MessageNeedMassEdit extends StateMachineMessage {
    getName() {
        return 'MessageNeedMassEdit';
    }
}

export class MessageRefreshListData extends StateMachineMessage {
    getName() {
        return 'MessageRefreshListData';
    }
}

export class MessageNeedRemove extends StateMachineMessage {
    getName() {
        return 'MessageNeedRemove';
    }
}

export class MessageNeedReduce extends StateMachineMessage {
    getName() {
        return 'MessageNeedReduce';
    }
}

export class MessageGenerateReport extends StateMachineMessage {
    getName() {
        return 'MessageGenerateReport';
    }
}
//***********

export class MessageSetPage extends StateMachineMessage {
    getName() {
        return 'MessageSetPage';
    }
}

export class MessageSetPageSize extends StateMachineMessage {
    getName() {
        return 'MessageSetPageSize';
    }
}

export class MessageSetShowDeleted extends StateMachineMessage {
    getName() {
        return 'MessageSetShowDeleted';
    }
}

export class MessageSetOrder extends StateMachineMessage {
    getName() {
        return 'MessageSetOrder';
    }
}

export class MessageSetFilter extends StateMachineMessage {
    getName() {
        return 'MessageSetFilter';
    }
}

export class MessageSaveResolvedData extends StateMachineMessage {
    getName() {
        return 'MessageSaveResolvedData';
    }
}

export class MessageNeedNavigation extends StateMachineMessage {
    getName() {
        return 'MessageNeedNavigation';
    }
}

export class MessageSetItemState extends StateMachineMessage {
    getName() {
        return 'MessageSetItemState';
    }
}
