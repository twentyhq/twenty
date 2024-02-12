isContactCreationEnabledChangeListener: 

@Injectable()
export class IsContactCreationEnabledChange

Listener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}